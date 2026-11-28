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
- [ ] Verify production/client bundles and deployed/runtime behavior for secret leakage (CI build workflow created; run and artifact inspection remain unverified).
- **Disposition:** Source audit completed. Firebase Admin module uses `server-only` and server credential variables; client Firebase configuration contains only web-client settings. Direct client Firestore access remains present. Gemini SDK is used in a client module with `NEXT_PUBLIC_GEMINI_API_KEY`, exposing the credential to browsers. Clerk-to-Firebase trusted token exchange was not found in the inspected source. Runtime/bundle scan is **Blocked** pending successful isolated workflow execution and artifact/log access; do not claim the bundles are clean.

### WP-02 — Firestore authorization & tenant-isolation design (pending WP-01 closure)
- [ ] Map existing workspace/document relationships and ownership/org semantics.
- [ ] Define trusted identity and authorization model for individual users and Clerk organizations.
- [ ] Define authorization rules for workspace/document read, create, update, delete, and cross-resource relationship checks.
- [ ] Plan how existing records will be preserved and safely mapped; identify migration needs (do not migrate yet).
- [ ] Write test cases for unauthorized access, cross-user/org access, forged ownership fields, and document/workspace relationship mismatches.
- [ ] Review design and risks before implementation.
- **Gate:** Do not deploy or enforce new Firestore rules until design is reviewed, existing data behavior is understood, and rules tests are in place.

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
- **Gemini credential boundary:** `config/GoogleAIModel.jsx` uses the browser-side SDK and `NEXT_PUBLIC_GEMINI_API_KEY`; any value configured under that variable is client-visible. The source demonstrates exposure without requiring the bundle scan.
- **Clerk/Firebase bridge:** no trusted token exchange implementation identified in the inspected source. This remains a source-review finding and may need further targeted repository search before implementation.
- **Runtime/bundle scan workflow:** separate workflow `.github/workflows/runtime-bundle-inspection.yml` created on `agentic-development`; manual trigger plus a push trigger limited to changes to that workflow file. It uses Node 24, `npm ci`, a placeholder-only build environment, and uploads `.next/static/` for three days. It does not deploy, pull Vercel environment values, or change the existing CI workflow.
- **Workflow run/artifact evidence:** not retrieved or inspected. GitHub integration exposed file creation/read operations but no workflow-dispatch action; run retrieval attempts were rejected by the integration, and local clone/build attempt failed because the environment could not resolve `github.com`. Therefore workflow execution, build success, logs, and artifact contents remain **unverified**.
- **Production configuration or deployment changes:** none performed as part of WP-01 review.

## Current next action

WP-01 source audit is completed, but runtime/bundle verification is blocked until the isolated workflow run and artifact are accessible. Do not proceed to WP-02 unless the project owner explicitly accepts this limitation.