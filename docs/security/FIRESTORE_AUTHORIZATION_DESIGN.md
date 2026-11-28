# Firestore Authorization & Tenant Isolation Design (WP-02)

- Status: Draft for Project Owner review
- Project: SyncSphere
- Branch: agentic-development
- Work package: M1 WP-02
- Date: 2026-11-28
- Scope: Design only; no code, rules, data, or production changes

## 1. Purpose
Define a trustworthy authorization model for direct Firestore client access. Firebase Auth identifies the caller; resource checks establish access to each workspace and related documents.

## 2. Verified baseline and constraints
- Clerk is the application identity provider; Firebase Web SDK performs client Firestore operations.
- The approved Clerk-to-Firebase custom-token bridge maps Firebase UID to stable Clerk user ID, but implementation is incomplete.
- Current client-side workspace filters use Clerk organization ID or email. These are query conveniences, not authorization.
- Collections: Workspace, workspaceDocuments, documentOutput.
- Workspace fields include workSpaceName, emoji, coverImage, createdBy (email), id, orgId.
- Document metadata fields include workspaceId, createdBy (email), coverImage, emoji, id, documentName, documentOutput.
- Content fields include docId, output, editedBy.
- No confirmed trusted UID ownership field exists in current records. Email and client-provided organization ID are not proof of authorization.
- Baseline assessment says deployed rules permit unrestricted reads/writes. Exact live rules must be re-confirmed before rollout. No rules file was found in the inspected branch tree.

## 3. Security objectives
1. Default deny; require authenticated Firebase identity.
2. Personal workspace access uses stable UID, not email.
3. Organization workspace access uses trusted membership, not client-supplied orgId.
4. Documents/content inherit parent workspace access and validate relationships.
5. Clients cannot assign/change owner, org, or membership roles.
6. Prevent cross-workspace relationships and unauthorized enumeration.
7. Preserve existing records/content during migration.
8. Test Rules using Firebase Emulator before staging.
9. Production rules/migration require separate explicit approval.

## 4. Proposed data model

### Workspace/{workspaceId}
Keep existing display fields where compatible; add security metadata in a controlled migration:
- accessScope: personal or organization.
- ownerUid: stable Clerk user ID/Firebase UID for personal workspaces.
- orgId: verified Clerk organization ID for organization workspaces.
- createdByUid: trusted creator UID for audit, not itself an access grant.
- createdAt and updatedAt: server timestamps where supported.

Legacy createdBy email and orgId may be retained for compatibility but must not be used as authorization inputs until reconciled. Avoid deleting/renaming legacy fields in the initial migration.

### Organization membership
Use a trusted membership collection, e.g. OrganizationMembership/{orgId}_{uid}, containing orgId, uid, role (owner/editor/viewer), status (active/revoked), and optional audit timestamps.
Membership records are provisioned/updated only by trusted server code that verifies Clerk organization membership. Clients cannot write membership records or self-assign roles. Keys and fields must align with validated identity.

Dependency: membership must be verified through Clerk server API/session context or another approved trusted source. Firebase user identity alone does not imply organization membership.

### Roles
- Owner: workspace administration and CRUD, including deletion.
- Editor: read and create/edit/rename/delete documents per final product policy; cannot transfer ownership or change security metadata/membership.
- Viewer: read-only.
Final org role mapping and editor deletion policy require owner review. No client role is trusted.

### workspaceDocuments/{documentId}
Retain current fields initially, but validate:
- workspaceId references an existing Workspace.
- createdByUid, if added, is trusted audit metadata.
- document key and embedded id agree, or embedded id is removed only through a later compatibility decision.
- workspaceId cannot be client-changed after creation; workspace moves are initially out of scope.

### documentOutput/{documentId}
- Content key equals metadata document key.
- docId equals document key.
- Authorization resolves metadata and its parent workspace.
- Content is accessible only when caller is authorized for parent workspace.
- Editor.js schema validation is handled separately; Rules should enforce bounded field constraints feasible within Rules.

## 5. Authorization matrix (draft)

| Resource/operation | Personal owner | Org owner | Org editor | Org viewer | Unauthenticated |
|---|---|---|---|---|
| Workspace read | Allow | Allow | Allow | Allow | Deny |
| Workspace create | Self-owned only | Trusted org member and permitted role | Deny | Deny | Deny |
| Workspace update display fields | Allow | Allow | Limited, per policy | Deny | Deny |
| Security metadata update | Trusted server only | Trusted server only | Deny | Deny | Deny |
| Workspace delete | Allow | Allow | Deny | Deny | Deny |
| Document metadata read | Allow | Allow | Allow | Allow | Deny |
| Document create/edit/rename | Allow | Allow | Allow | Deny | Deny |
| Document delete | Allow | Allow | Allow, subject to final policy | Deny | Deny |
| Content read | Allow | Allow | Allow | Allow | Deny |
| Content write | Allow | Allow | Allow | Deny | Deny |
| Membership write | Trusted server only | Trusted server only | Deny | Deny | Deny |

Personal workspace permission checks require ownerUid to match request.auth.uid and scope personal. Organization access uses trusted membership records and workspace policy. Exact role mapping is a review gate.

## 6. Firestore Rules enforcement direction
Rules should default-deny and provide helpers:
- signedIn: request.auth exists.
- isPersonalOwner: authenticated UID matches ownerUid and personal scope.
- hasActiveOrgMembership: trusted membership record matches UID/org and active status.
- canReadWorkspace: personal owner or active org member with permitted role.
- canWriteWorkspace: owner/editor only.
- canManageWorkspace: owner only.
- canReadDocument: metadata and workspace exist; caller can read parent workspace.
- canWriteDocument: same relationship validation plus write permission.
- validDocumentWorkspaceLink: referenced workspace exists; relationship is immutable.
- validContentLink: content key/docId match metadata key and parent workspace.

Explicit rules must cover Workspace, workspaceDocuments, documentOutput, and membership collections. No broad wildcard allow rules. Membership writes denied to clients. Unmatched paths remain denied.

Account for Rules access-call limits and query constraints. Existing queries filtered by email/org may need redesign to be provably authorized by Rules; queries are not post-fetch authorization.

## 7. Data preservation and migration (no migration in WP-02)
1. Inventory representative metadata and relationships without exposing private content.
2. Classify personal/org scope using verified Clerk org and ownership evidence—not email guesses alone.
3. Resolve existing owner UIDs and membership from trusted sources. Ambiguous records go to owner review, not guesswork.
4. Produce a dry-run report: counts by scope, missing links, duplicate IDs, orphan metadata/content, ambiguous ownership, proposed security fields.
5. Back up/export and verify recovery under an approved process.
6. Develop an idempotent migration and rollback/recovery plan; obtain explicit approval.
7. Deploy Rules only after bridge, emulator tests, migration rehearsal, staging validation, and separate owner approval.

Keep legacy fields until a compatibility/deprecation decision. No destructive changes or migration are authorized.

## 8. Security test plan
### Identity and ownership
- Unauthenticated reads/writes denied on all collections.
- Personal owner UID can access per policy; different UID denied.
- Forged email, createdBy, ownerUid, or orgId cannot grant access.
- Client owner UID mutation denied.
- Personal/org scope confusion denied.

### Organization membership
- Active members follow role policy.
- Viewer mutations denied.
- Editor cannot delete workspace or alter membership/security metadata.
- Nonmembers and revoked members denied.
- Client-created/forged membership denied.
- Org ID spoofing and cross-org access denied.

### Relationships and integrity
- Missing workspace, mismatched workspace IDs, and unauthorized references denied.
- Metadata ID mismatch denied or embedded id omitted by canonical policy.
- Content key/docId mismatch denied.
- Content without metadata/parent workspace denied.
- Workspace move attempts denied absent trusted operation.

### Query compatibility
- Email/org client filters are not authorization proof.
- Rules-compatible queries are tested; redesign queries if Rules cannot prove access.
- No unauthorized workspace enumeration.

### Failure/regression
- Emulator tests cover seeded identities, reads/writes, creates/deletes, field changes, roles, cross-tenant paths.
- CRUD regressions run alongside security tests.

## 9. Decisions to resolve during review
1. Canonical personal/org scope and legacy classification.
2. Trusted Clerk role mapping to SyncSphere owner/editor/viewer.
3. Personal workspace default and conversion of current email-as-org fallback.
4. Trusted membership lookup, provisioning, refresh/revocation behavior.
5. Owner transfer (initially no client transfer).
6. Organization editor document deletion policy.
7. Rules-compatible client queries vs trusted server query endpoints.
8. Allowed mutable fields per collection.
9. Migration mapping and ambiguous-record handling.
10. Rules access-call limits, indexes, and query constraints.

## 10. Risks and dependencies
- Permissive deployed Rules remain critical until remediation and rollout.
- Existing email/org data needs trusted UID/membership mapping.
- Custom-token bridge is approved but not implemented.
- Rules must be correct and compatible with direct client SDK queries.
- Multi-operation CRUD atomicity is a separate WP-07.
- Membership provisioning/revocation requires trusted server integration.
- Complex operations may require server endpoints because Rules are not a complete business-logic layer.

## 11. Sequencing
1. Project Owner review of this draft and unresolved decisions.
2. Implement WP-03 Clerk/Firebase bridge before Rules depend on request.auth.uid.
3. Finalize org membership, roles, legacy mapping, query compatibility, and field immutability.
4. WP-04 implement deny-by-default Rules and Emulator tests.
5. Dry-run legacy data mapping and staging validation.
6. Obtain explicit approval before production migration or Rules deployment.

## 12. WP-02 acceptance criteria
- [ ] Collections, fields, relationships, and access paths mapped.
- [ ] Trusted UID and org-membership model defined.
- [ ] CRUD and relationship policy matrix reviewed.
- [ ] Preservation/migration plan reviewed.
- [ ] Rules test scenarios defined.
- [ ] Query constraints understood.
- [ ] Open decisions resolved or explicitly tracked.
- [ ] Project Owner review/approval recorded.

---
End of WP-02 design draft.
