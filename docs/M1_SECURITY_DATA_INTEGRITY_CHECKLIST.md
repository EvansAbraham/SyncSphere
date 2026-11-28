# M1 — Security & Data Integrity Temporary Checklist

**Project:** SyncSphere  
**Branch:** `agentic-development`  
**Status:** Active working checklist (temporary; to be consolidated into milestone documentation at M1 closure)  
**Created:** 2026-11-28

> This checklist tracks M1 security and data-integrity investigation/remediation in small, sequential work packages. It is not authorization to deploy, change production Firebase rules/configuration, migrate data, or perform destructive operations. Preserve existing workspaces and documents.

## Working rules

- Address one work package at a time, in order, unless dependencies are documented.
- Inspect first; make narrowly scoped changes only after the plan and risks are clear.
- Use tests and CI for each implementation work package.
- Track status as **Pending**, **In progress**, **Passed**, **Failed**, or **Blocked**; never mark unrun checks as passed.
- Stop and request owner approval before production configuration/rules changes, migrations, destructive actions, or material security/data-loss risks.
- For CI work, wait for the workflow to finish, inspect its logs, inspect downloaded artifacts when applicable, and only then report the result.

## Checklist

### WP-01 — Server-only boundary audit
- [x] Source review of Firebase Admin isolation, client Firebase configuration, direct client-side Firestore access, Gemini client usage, and Clerk/Firebase identity bridge.
- [x] Build and inspect isolated client bundles for secret leakage (completed; production/deployed runtime behavior remains unverified).
- **Disposition:** Source audit and isolated client-bundle inspection completed. Firebase Admin module uses `server-only` and server credential variables; client Firebase configuration contains only web-client settings. Direct client Firestore access remains present. Gemini SDK is used in a client module with `NEXT_PUBLIC_GEMINI_API_KEY`, exposing the credential to browsers. Clerk-to-Firebase trusted token exchange was not found in the inspected source. Isolated bundle scan found no Firebase Admin module identifier, private-key header, service-account private-key/client-email fields, Google API key token-like value, or Gemini key env name. The artifact did contain Gemini SDK code and only the inspection placeholder API key; the scan does not prove deployed runtime behavior or that the live key is absent from any other build.

### WP-02 — Firestore authorization & tenant-isolation design (in progress — draft committed)
- [x] Map existing workspace/document relationships and ownership/org semantics (source review completed; existing ownership fields are email/org-oriented and not trusted).
- [x] Draft trusted identity and authorization model for individual users and Clerk organizations; owner/org role and membership mapping decisions remain open for review.
- [x] Draft authorization rules for workspace/document read, create, update, delete, and cross-resource relationship checks; final role policy review pending.
- [x] Draft preservation and migration approach; mapping remains unexecuted and approval-gated.
- [x] Define test scenarios for unauthorized access, cross-user/org access, forged ownership fields, and document/workspace relationship mismatches.
- [ ] Project Owner review of design and open decisions before implementation.
- **Design draft:** [docs/security/FIRESTORE_AUTHORIZATION_DESIGN.md](FIRESTORE_AUTHORIZATION_DESIGN.md). No rules implementation, data migration, or production change has been performed. **Gate:** Owner review and resolution/acceptance of open decisions before WP-03/WP-04 implementation.

### WP-03 — Clerk ↔ Firebase trusted identity bridge
- [ ] Implement trusted Clerk identity to Firebase UID/token exchange according to the approved architecture.
- [ ] Ensure client-provided user/org IDs are not treated as proof of identity.
- [ ] Add bridge tests for valid, invalid, missing, expired, and mismatched identity/token cases.
- [ ] Verify session lifecycle and sign-out behavior.
- **Dependency:** WP-02 design.

### WP-04 — Firestore rules implementation & validation
- [ ] Implement deny-by-default rules using the approved authorization design.
- [ ] Add automated Firestore Rules tests for authorized and unauthorized cases.
- [ ] Validate against representative existing-data scenarios and ensure no legitimate content is lost or made inaccessible unexpectedly.
- [ ] Review rules for every collection and operation.
- **Gate:** Production rules changes require explicit owner approval.

### WP-05 — Gemini server-side migration & credential protection
- [ ] Move Gemini SDK/request and credential handling out of client modules into a server-only route/service.
- [ ] Authenticate requests and authorize workspace/document context where applicable.
- [ ] Validate prompts/input and Editor.js response structure/block schemas.
- [ ] Add rate/abuse controls, timeouts, safe error handling, and tests.
- [ ] Verify no Gemini secret is present in client bundles; plan rotation/restriction of exposed credentials.
- **Gate:** Credential rotation and production configuration changes require explicit approval.

### WP-06 — Sensitive data & API exposure review
- [ ] Review API responses, logs, error messages, client-visible fields, and privileged operations.
- [ ] Confirm secrets, private content, and ownership metadata are not unnecessarily exposed.
- [ ] Remediate confirmed issues with regression tests.

### WP-07 — Data integrity & CRUD failure handling
- [ ] Review workspace/document creation write sequences for partial completion.
- [ ] Review document/workspace deletion and cascade behavior for orphan risks.
- [ ] Review validation, workspace-document relationships, and stale/duplicate mutations.
- [ ] Design recovery/compensation for partial failures before implementation.
- [ ] Add failure-path tests; ensure existing user content is protected.

### WP-08 — Security regression coverage
- [ ] Add/verify tests covering authentication, authorization, ownership/tenant isolation, forged IDs, invalid inputs, CRUD failures, and AI boundaries.
- [ ] Ensure checks are included in CI and failures are actionable.

### WP-09 — Dependency/security audit
- [ ] Run a full dependency audit.
- [ ] Triage vulnerabilities by severity, reachability, fix availability, and compatibility.
- [ ] Plan safe, bounded upgrades; avoid blind `npm audit fix --force`.

### WP-10 — Environment/configuration consistency
- [ ] Compare Firebase client/Admin configuration and environment variable naming.
- [ ] Verify project consistency, startup validation, and deployment config without exposing secrets.
- [ ] Resolve confirmed mismatches and test configuration failure cases.

### WP-11 — App Check review
- [ ] Confirm web App Check registration/provider configuration.
- [ ] Evaluate integration and enforcement rollout.
- [ ] Test legitimate traffic before enforcement.
- **Note:** App Check is abuse resistance; it does not replace authorization.

### WP-12 — M1 closure & evidence
- [ ] Review each work package and remaining risks.
- [ ] Confirm required CI/test/lint/build checks pass on the current branch commit.
- [ ] Update milestone/risk docs with verified results and limitations.
- [ ] Obtain owner disposition for any remaining critical risks.
- [ ] Declare M1 complete only when roadmap exit criteria are met.

---

## WP-01 audit summary (source-level; 2026-11-28)

- **Firebase Admin module:** source-level boundary review verified `import "server-only"`, server-only Admin credential variables, lazy initialization, named-app reuse, and client/Admin project ID matching. This is a source finding only—not proof of bundle exclusion.
- **Firebase client configuration:** client config reads `NEXT_PUBLIC_FIREBASE_*` values only and initializes Firebase Web SDK; no Admin private credentials are present in the inspected module.
- **Direct client Firestore access:** confirmed in client components for workspace/document data operations. These calls rely on Firestore rules for authorization; client-side query filters are not an authorization control.
- **Gemini credential boundary:** `config/GoogleAIModel.jsx` uses the browser-side SDK and reads `NEXT_PUBLIC_GEMINI_API_KEY`; any value configured under that variable is client-visible. `.env.sample` instead documents `NEXT_GEMINI_API_KEY`, so naming is inconsistent. Vercel project environment metadata (values not decrypted) confirms `NEXT_PUBLIC_GEMINI_API_KEY` is configured for Development, Preview, and Production. WP-05 owns server-side migration and credential protection; no Vercel env mutation, credential rotation, or deployment was performed during WP-01.
- **Clerk/Firebase bridge (targeted follow-up completed):** existing `docs/architecture/ADR-001-clerk-firebase-auth-bridge.md` accepts Clerk-to-Firebase custom-token bridge architecture, and `docs/security/FIREBASE_AUTH_BRIDGE.md` specifies implementation. Source inspection confirms `config/firebaseAuth.js` only initializes Firebase Client Auth (`getAuth(app)`). No trusted server token-issuance endpoint, Firebase Admin custom-token minting call, or client custom-token exchange/lifecycle implementation was found in the branch tree/source reviewed. Bridge architecture is approved; implementation remains pending its scoped work package.
- **Runtime/bundle scan workflow:** separate workflow `.github/workflows/runtime-bundle-inspection.yml` created on `agentic-development`; manual trigger plus a push trigger limited to changes to that workflow file. It uses Node 24, `npm ci`, a placeholder-only build environment, and uploads `.next/static/` for three days. It does not deploy, pull Vercel environment values, or change the existing CI workflow.
- **Workflow run/artifact evidence:** verified successful workflow run [#1](https://github.com/EvansAbraham/SyncSphere/actions/runs/46150099812) on commit `fe63660563a0cb02f160fb0a06a42cc03aa7a7f7`. All six steps completed successfully, including Node 24 setup, `npm ci`, placeholder-only Next.js production build, and artifact upload. Job logs inspected. Artifact `syncsphere-client-bundles` (ID `15265795901`, 656,977 bytes, SHA-256 `8bef2cb61df1abd72e0616b84e04a30cceb45ae467e4cf7ba273ec67c53928e2`) downloaded and scanned: 46 files (35 JS; 2,026,401 bytes extracted). No Firebase Admin module identifier, private-key header, service-account private-key/client-email fields, Google API-key token-like string, or Gemini env-name match. `CLERK_SECRET_KEY` text appears only as a reference in Clerk's client library—not a value. The client bundle includes Gemini SDK code with the non-secret `inspection-placeholder` key. This confirms isolated bundle findings only; production/deployed runtime was not inspected.
- **Production configuration or deployment changes:** none performed as part of WP-01 review.

## Current next action

WP-01 is complete. WP-02 authorization design draft is committed for Project Owner review; resolve open design decisions before implementation. Gemini key protection remains tracked in WP-05.

### WP-01 follow-up — identity bridge investigation and Gemini risk handoff (2026-11-28)

- **WP-01-A — Identity bridge investigation:** Existing ADR-001 (`docs/architecture/ADR-001-clerk-firebase-auth-bridge.md`) records an accepted Clerk-to-Firebase custom-token bridge architecture, and `docs/security/FIREBASE_AUTH_BRIDGE.md` is an approved implementation specification. Source/tree inspection confirmed `config/firebaseAuth.js` initializes Firebase Client Auth only (`getAuth(app)`). No token-issuance route, Admin custom-token minting call, or client custom-token exchange/lifecycle integration was identified in the inspected source. This is a confirmed implementation gap, not a missing design decision; WP-03 implementation remains pending its scoped approval.
- **WP-01-B — Gemini exposure risk handoff:** `config/GoogleAIModel.jsx` reads `NEXT_PUBLIC_GEMINI_API_KEY` in a client-side Gemini SDK module. `.env.sample` names `NEXT_GEMINI_API_KEY` instead, creating a config-name mismatch. Vercel environment metadata (without decrypting values) shows `NEXT_PUBLIC_GEMINI_API_KEY` targets Development, Preview, and Production. This exposure is assigned to WP-05 for server-side migration, tests, and credential protection.
- **Temporary rename caution:** Renaming only the Vercel variable to `NEXT_GEMINI_API_KEY` will not secure the existing client module while it still reads the public variable. Removing the public variable before migrating the Gemini call server-side would likely break the AI feature; leaving the old public variable in place keeps browser exposure. Therefore no variable rename/removal was made. A safe remediation needs the WP-05 server migration (or explicit owner approval to disable the feature temporarily) and appropriate credential rotation/restriction.
- **Scope/evidence:** No Vercel production environment values were changed, decrypted, rotated, or deployed in this follow-up.
