# M1 — Security Architecture Decision Log

- **Project:** SyncSphere
- **Branch:** `agentic-development`
- **Created:** 2026-11-28
- **Status:** Living decision history for M1 security and data-integrity work
- **Owner:** Project Owner

## 1. Purpose

This document records meaningful security architecture decisions made during M1, including the original architecture, the decision and rationale, what changed, implementation status, verification evidence, consequences, and remaining risks.

It complements (does not replace):
- [M1 Security & Data Integrity Checklist](../M1_SECURITY_DATA_INTEGRITY_CHECKLIST.md) — work-package progress and gates.
- [Firestore Authorization & Tenant Isolation Design (WP-02)](FIRESTORE_AUTHORIZATION_DESIGN.md) — authorization policy and unresolved design questions.
- [Firebase Auth Bridge Implementation Specification](FIREBASE_AUTH_BRIDGE.md) — bridge stages and implementation constraints.
- [ADR-001: Clerk Identity Bridge for Firebase Authentication](../architecture/ADR-001-clerk-firebase-auth-bridge.md) — selected identity-bridge architecture.

This log is a record, not an authorization. It does not grant approval for production deployments, rules changes, migrations, destructive operations, credential changes, or environment-variable changes.

## 2. Status legend

- **Proposed:** Under consideration; not approved.
- **Approved:** Architecture/design approved, implementation may still be incomplete.
- **Implemented:** Code/docs have been committed; verification may still be pending.
- **Verified:** Evidence for the stated scope has been reviewed (e.g. CI/tests/source inspection). This does not imply production deployment or runtime validation.
- **Deferred:** Intentionally postponed to a later work package.
- **Superseded:** Replaced by a later decision; retained for history.
- **Blocked:** Cannot proceed safely until named prerequisite is addressed.

## 3. Baseline — architecture before M1

Based on source reviews and the current baseline/design records, the pre-M1 application had the following relevant characteristics. These are source-level findings; live production behavior must be independently re-verified where noted.

| Area | Pre-M1 state / risk |
|---|---|
| Application identity | Clerk sign-in protected application routes. |
| Firestore client identity | Firebase Client SDK was initialized independently; no verified Clerk-to-Firebase custom-token exchange was present in the inspected source. |
| Firestore authorization | Direct client CRUD relied on deployed Rules. Baseline review reported permissive read/write rules; exact deployed rules require re-confirmation. |
| Workspace ownership | Legacy ownership/org metadata used email and client-provided org identifiers; no confirmed trusted UID ownership metadata existed in records reviewed. |
| Firebase Admin | Server-side Admin initialization existed in the source reviewed; WP-01 verified the server-only boundary and configuration checks. |
| Gemini | Browser-side SDK/key usage was found with `NEXT_PUBLIC_GEMINI_API_KEY`; the naming in `.env.sample` was inconsistent. |
| Data integrity | Multi-step workspace/document/content CRUD can have partial-failure/orphan risks; deeper review is assigned to WP-07. |

## 4. Decision timeline

| Date | WP / decision | Status | Summary |
|---|---|---|---|
| 2026-11-28 | WP-01 / Firebase Admin boundary | Verified (source + bundle inspection) | Preserve Admin SDK as server-only; lazy initialization and project consistency validation. |
| 2026-11-28 | WP-02 / Firestore authorization | Approved design; open policy decisions | Default-deny, stable UID, trusted organization membership, inherited workspace/document authorization, preservation-first migration. |
| 2026-11-28 | WP-03 / Clerk-Firebase bridge | In progress | Stage B token endpoint and Stage C client lifecycle implemented and CI-verified; Stage D integration remains. |
| 2026-11-28 | WP-03 Stage C | Verified | Firebase Auth lifecycle provider synchronizes Clerk identity, sign-out and account switches; readiness/error hook; focused tests and CI #95 green. Stage D/E remain. |
| TBD | WP-04 Rules implementation | Pending | Rules and Emulator tests depend on identity bridge and final policy decisions. |
| TBD | WP-05 Gemini credential boundary | Deferred | Server-side AI request path, validation, authorization, abuse controls, and exposed-key response. |

## 5. Architecture decisions

### ADR-M1-001 — Keep Firebase Admin isolated to trusted server code

- **Date:** 2026-11-28
- **Work package:** WP-01
- **Status:** Verified (source-level and isolated bundle inspection)
- **Original behavior:** Firebase Admin initialization was present in the codebase. Client Firestore calls remained in browser components.
- **Decision/change:** Keep Admin SDK initialization in a server-only module, mark the boundary with `server-only`, lazily initialize and reuse the named Admin app, and validate the Admin/client Firebase project configuration.
- **Rationale:** Avoid privileged credentials and Admin code entering browser bundles; fail fast on project mismatch; minimize initialization side effects.
- **Alternatives considered:** Browser-side Admin initialization (not acceptable); moving all Firestore access to Admin/server endpoints (larger refactor and requires explicit authorization in every server handler).
- **Security impact:** Reduces risk of Admin credential/code exposure and accidental privileged data access from client code.
- **Verification:** WP-01 source audit and isolated client-bundle scan; workflow run #77 succeeded, and its artifact was reviewed. This is not proof of deployed runtime behavior.
- **Files/evidence:** `lib/firebase-admin/admin.js`; WP-01 checklist summary; runtime bundle inspection workflow.
- **Residual risks:** Direct client Firestore operations still require correct Rules. Server bundle/runtime behavior is not continuously proven by this scan.

### ADR-M1-002 — Firestore authorization is deny-by-default and resource-based

- **Date:** 2026-11-28
- **Work package:** WP-02
- **Status:** Owner-approved design; implementation pending
- **Original behavior/risk:** Direct client CRUD existed. Legacy `createdBy` email and client-provided `orgId` were not trusted authorization evidence. The baseline review reported permissive deployed Rules; exact live Rules remain a re-confirmation item.
- **Decision/change:** Adopt a deny-by-default Rules model. Personal workspaces are tied to stable UID; organization workspaces rely on trusted membership records; workspace roles determine permissions; documents and content inherit access from a validated parent workspace; clients cannot self-assign owner/org/security fields or membership roles.
- **Rationale:** Identity alone does not authorize access to a resource. Email, client filters, IDs, and organization values are spoofable and must not serve as permission proof.
- **Alternatives considered:** Trust client filters/legacy email (rejected); immediate Admin/server-only data-access rewrite (not selected for this recovery, but may be revisited).
- **Security impact:** Target is tenant isolation, ownership enforcement, relationship validation, and prevention of unauthorized enumeration and mutation.
- **Verification:** WP-02 design draft reviewed and explicitly approved on 2026-11-28. No Rules implementation, migration, or production change has been performed.
- **Files/evidence:** `docs/security/FIRESTORE_AUTHORIZATION_DESIGN.md`; checklist WP-02.
- **Open decisions:** Legacy scope classification; trusted membership provisioning/revocation; role mapping; editor delete policy; query compatibility; mutable fields; migration mapping and ambiguous records. Resolve these before WP-04 implementation.

### ADR-M1-003 — Clerk is the trusted source for user identity

- **Date:** 2026-11-28
- **Work package:** WP-03 / ADR-001
- **Status:** Architecture approved; Stage B endpoint and Stage C lifecycle verified; Stage D integration pending
- **Original behavior/risk:** Clerk authenticated the application, while Firebase client Auth was independent. Firestore requests did not yet have a verified Firebase UID corresponding to the Clerk user in the inspected source.
- **Decision/change:** Clerk remains the application identity provider. A trusted server verifies the Clerk session and derives Firebase UID exclusively from Clerk's stable `userId`. Firebase UID must equal Clerk user ID. Email is not the authorization identity; org selection remains separate.
- **Rationale:** Provide Firestore Rules a trusted identity while preserving the existing Firebase client-side data-access approach.
- **Alternatives considered:** Client-supplied UID/email/org (rejected); server-only Firestore Admin data access (not selected due to wider refactor and explicit authorization burden).
- **Security impact:** Prevents caller-controlled identity from being used to mint tokens; establishes a stable identity foundation for Rules.
- **Verification:** Architecture documented in ADR-001 and bridge spec; endpoint tests specifically assert identity derives from verified Clerk user and ignores caller-supplied identity fields.
- **Files/evidence:** `docs/architecture/ADR-001-clerk-firebase-auth-bridge.md`; `docs/security/FIREBASE_AUTH_BRIDGE.md`.
- **Residual risks:** Auth lifecycle synchronization, account switching, retry handling, and sign-out clearing still need client-side implementation and validation.

### ADR-M1-004 — Mint Firebase custom tokens through a protected server endpoint

- **Date:** 2026-11-28
- **Work package:** WP-03 Stage B
- **Status:** Implemented; CI verified; release readiness incomplete
- **Original behavior:** No trusted token-issuance route or client custom-token exchange was found in the reviewed source before Stage B.
- **Decision/change:** Add `POST /api/auth/firebase-token`. It checks same-origin request signals, verifies Clerk session server-side, creates a Firebase custom token only for that verified Clerk user ID, returns no-cache response headers, and uses generic error responses. Caller-supplied UID/email/org/body fields are not used to choose the token identity.
- **Rationale:** Keep token minting and Admin privilege on the server; establish a narrow trusted bridge endpoint without granting Admin Firestore access.
- **Alternatives considered:** Accept identity from request payload (rejected); expose Firebase Admin to the client (rejected); use Admin SDK for Firestore access in this bridge (out of scope).
- **Security impact:** Provides a trusted token issuance path, mitigates token response caching, and checks origin to reduce cross-origin misuse. Origin validation is not a complete abuse defense.
- **Verification:** Five focused route tests cover missing/cross-origin headers, unauthenticated requests, verified UID derivation/spoofed request identity, and generic error handling. CI run #85 (2026-11-28) completed successfully, including lint, tests, and production build; logs were inspected and route appeared in build output.
- **Files/evidence:** `app/api/auth/firebase-token/route.js`; `tests/auth/firebase-token-route.test.js`; CI run [#85](https://github.com/EvansAbraham/SyncSphere/actions/runs/46152946990).
- **Residual risks / follow-up:** No distributed rate limit or robust abuse control has been implemented. Serverless in-memory throttling would not be sufficient as a distributed control. Origin/Host handling must be reviewed against deployment/proxy behavior. Client lifecycle is now implemented and CI-verified but not yet integrated with/gating Firestore consumers. Endpoint is not deployed or claimed production-ready.

### ADR-M1-006 — Synchronize Firebase Client Auth with Clerk lifecycle

- **Date:** 2026-11-28
- **Work package:** WP-03 Stage C
- **Status:** Implemented and CI-verified; Stage D integration pending
- **Original behavior/risk:** Firebase Client Auth had been initialized separately from Clerk; workspace/document consumers could execute Firestore calls without waiting for a trusted Firebase identity to be established.
- **Decision/change:** Mount `FirebaseAuthBridgeProvider` inside `ClerkProvider`. When Clerk is ready and signed in, the provider POSTs to the trusted token endpoint with same-origin credentials and `cache: no-store`, then signs in Firebase with the server-minted custom token. On sign-out it clears Firebase Auth. On account switch it clears the prior UID before exchanging a token for the new Clerk user. A generation/cancellation guard prevents stale requests from applying, synchronization is serialized, and the returned Firebase UID is checked against the Clerk user ID. Provider state is exposed through `useFirebaseAuthBridge()`.
- **Rationale:** Prevent Firestore operations from running with an absent or stale Firebase identity, reduce account-switch race risk, and make bridge readiness/errors observable to consumer components.
- **Alternatives considered:** Firestore calls continuing without a bridge (rejected for Stage D); client-supplied UID (rejected); parallel uncontrolled token exchanges (rejected).
- **Security impact:** Establishes client identity synchronization and safe state visibility. It does not authorize workspace/document access; Firestore Rules remain the enforcement boundary.
- **Verification:** Focused tests cover successful token exchange, sign-out cleanup, prior-UID cleanup, account switching, endpoint failure, and UID mismatch. CI run #95 completed successfully on commit `d8cb30f3242827bff9c920554be40034e2f221b9`: ESLint, tests, and production build passed. Evidence: [run #95](https://github.com/EvansAbraham/SyncSphere/actions/runs/46156856828).
- **Files/evidence:** `app/providers/FirebaseAuthBridge.jsx`, `app/layout.js`, `tests/auth/firebase-auth-bridge-provider.test.jsx`, bridge specification, and WP-03 checklist.
- **Residual risks / follow-up:** Firestore consumers have not yet been gated on readiness; Stage D owns consumer integration/regression. Explicit retry/backoff and Firebase Auth Emulator coverage remain pending. Token endpoint distributed abuse/rate limiting and deployment-origin/proxy validation remain open. No production deploy, Rules changes, environment-variable changes, or data migration occurred.

### ADR-M1-005 — Move Gemini API key and model requests behind a trusted server boundary

- **Date:** 2026-11-28
- **Work package:** WP-05
- **Status:** Deferred / not yet implemented
- **Original behavior/risk:** The reviewed client module `config/GoogleAIModel.jsx` reads `NEXT_PUBLIC_GEMINI_API_KEY` and uses the browser-side Gemini SDK. A public-prefixed key is browser-exposed by design. `.env.sample` documents `NEXT_GEMINI_API_KEY`, creating a naming mismatch.
- **Decision direction:** Move AI requests and credential handling into a server-only route/service; authenticate caller and authorize workspace/document context; validate input and Editor.js output; apply timeouts, safe errors, and abuse controls. Verify bundles and then plan key restrictions/rotation separately.
- **Rationale:** Keep the credential private, prevent unauthenticated or cross-workspace AI usage, and enforce server-side validation and resource controls.
- **Alternatives considered:** Keep key in browser (rejected as secure credential boundary); merely rename the environment variable (does not hide a client-exposed key).
- **Security impact:** Expected to reduce credential exposure and enable request-level authentication, authorization, validation, and usage controls.
- **Verification:** WP-01 source audit and client bundle review identified the current exposure; WP-05 implementation and verification are pending.
- **Approval gate:** Credential rotation/restriction, production environment changes, and deployment require explicit owner approval.
- **Files/evidence:** `config/GoogleAIModel.jsx`; `.env.sample`; WP-01 checklist.

## 6. Original architecture vs. M1 target

| Concern | Original / pre-M1 | M1 decision / target | Current status |
|---|---|---|---|
| Admin SDK | Server initializer existed; boundary verification required | Explicit server-only isolation, lazy init, project validation | WP-01 verified in source/bundle scope |
| User identity for Firestore | Clerk session and Firebase client auth were separate | Server-minted Firebase token maps UID to verified Clerk user | Stage B endpoint implemented; client lifecycle pending |
| Firestore authorization | Direct client CRUD and reported permissive Rules | Default deny; resource ownership and trusted membership | Design approved; WP-04 pending |
| Workspace ownership | Legacy email/org fields | Stable UID + trusted org membership/security metadata | Schema and migration decisions pending |
| Membership/roles | Not established as trusted in reviewed records | Trusted membership, Owner/Editor/Viewer policy | Design direction approved; provisioning and exact policy pending |
| AI credential | Browser-side key via public env variable | Server-only AI request and key boundary | WP-05 deferred |
| CRUD integrity | Multi-step direct writes/deletes | Review atomicity, relationship integrity, recovery and failure paths | WP-07 pending |

## 7. Security improvements implemented so far

These are narrow, evidence-backed accomplishments and must not be interpreted as M1 completion:

- Firebase Admin initialization has a reviewed server-only boundary and project consistency checks.
- A Firestore authorization model has been approved, though not enforced yet.
- A server token endpoint now derives Firebase custom-token UID from the verified Clerk session and ignores caller identity fields.\n- A root-mounted client provider synchronizes Firebase Auth sign-in/sign-out and account switches with Clerk, exposes readiness/error state, and has focused CI-verified lifecycle tests.
- Focused token endpoint tests and CI checks pass for the recorded Stage B commit.

## 8. Deferred work, blockers, and known risks

- **WP-03:** Stage B token endpoint and Stage C client lifecycle are implemented and CI-verified. Stage D Firestore consumer readiness gating/integration regression and Stage E acceptance remain pending. Explicit retry/backoff and Emulator coverage are deferred; endpoint abuse/rate control and proxy/origin review remain open.
- **WP-04:** Strict Rules implementation is blocked on completing the bridge and resolving authorization-policy/schema/membership/query/migration decisions. No production Rules have changed.
- **WP-05:** Gemini server-side migration, validation, authorization, abuse controls, and exposed-key restriction/rotation plan pending. No environment values or credential changes have been made.
- **WP-06:** Sensitive-data/API-exposure review pending.
- **WP-07:** CRUD atomicity, partial failures, orphan prevention, recovery and data integrity work pending.
- **WP-08:** Consolidated regression coverage pending.
- **WP-09:** Dependency audit and bounded remediation pending.
- **WP-10:** Environment/config consistency work pending; no production environment variables changed.
- **WP-11:** App Check review pending; App Check will not substitute for Rules authorization.
- **WP-12:** M1 closure/evidence/owner disposition pending.

## 9. Evidence and source of truth

For detailed status and evidence, use the M1 checklist and linked work-package documents. CI run claims are scoped to the recorded commit and jobs; do not infer deployed production behavior from CI success.

- [WP-01 runtime bundle inspection workflow run #1](https://github.com/EvansAbraham/SyncSphere/actions/runs/46150099812)
- [WP-03 Stage B CI run #85](https://github.com/EvansAbraham/SyncSphere/actions/runs/46152946990)\n- [WP-03 Stage C CI run #95](https://github.com/EvansAbraham/SyncSphere/actions/runs/46156856828)
- [WP-02 authorization design](FIRESTORE_AUTHORIZATION_DESIGN.md)
- [WP-03 bridge specification](FIREBASE_AUTH_BRIDGE.md)
- [ADR-001 identity bridge](../architecture/ADR-001-clerk-firebase-auth-bridge.md)
- [M1 checklist](../M1_SECURITY_DATA_INTEGRITY_CHECKLIST.md)

## 10. Change-history maintenance rules

1. Record significant security/architecture decisions before implementation when they affect trust boundaries, identity, authorization, data shape, credentials, or rollout.
2. After implementation, update the entry with changed files, commit, tests, CI evidence, and residual risks.
3. Distinguish **approved**, **implemented**, and **verified**; never collapse them into one status.
4. If a decision changes, append a superseding entry and mark the prior decision superseded; preserve the history.
5. At every work-package closure and M1 closure, reconcile this log against the checklist, source, tests, and CI.
6. Keep environment, Rules, migration, destructive, and deployment actions approval-gated.

## 11. Update history

- **2026-11-28:** Initial log created with pre-M1 baseline, WP-01, WP-02, WP-03 identity/token endpoint decisions, WP-05 deferred direction, milestone comparison, and current risks.\n- **2026-11-28:** Added ADR-M1-006 for WP-03 Stage C client lifecycle, updated WP-03 status/evidence, and recorded interview narrative takeaways (functionality-first baseline → security audit → trusted identity bridge → remaining integration/enforcement work).
