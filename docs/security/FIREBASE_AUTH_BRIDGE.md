# Firebase Auth Bridge Implementation Specification

- **Status:** Stage C lifecycle implementation committed and CI-verified; Stage D integration/regression and Stage E acceptance pending
- **Project:** SyncSphere
- **Target branch:** `agentic-development`
- **Related:** `docs/architecture/ADR-001-clerk-firebase-auth-bridge.md`

## Goal

Establish a Firebase Authentication identity for the existing Firestore client SDK by securely bridging the verified Clerk session to Firebase Auth. This work is incremental and must not enable strict production Firestore Rules until authorization design, data migration, and compatibility checks are complete.

## Invariants

- Firebase UID equals the verified Clerk user ID.
- Only the server may verify Clerk sessions and mint Firebase custom tokens.
- The client cannot choose the UID or authorization claims.
- Firebase Admin is server-only and is not used for Firestore data access in this bridge.
- Email is not an authorization identity.
- Organization switching does not change Firebase UID.
- Token responses are not cached; credentials and custom tokens are not logged.
- Auth initialization and synchronization must handle loading, signed-out, signed-in, error, and sign-out states without exposing stale identity.

## Work packages

### WP1 — Firebase Auth client initialization

- Add Firebase Client Auth initialization to the existing Firebase app.
- Reuse the existing app instance; avoid duplicate initialization.
- Export the Auth instance from a clear configuration module.
- Add Firebase Auth lifecycle synchronization only after the token endpoint exists.
- Ensure sign-out clears Firebase Auth state as well as Clerk state.

### WP2 — Firebase Admin token issuer

- Add Firebase Admin as a server-only dependency.
- Initialize Admin SDK using supported environment configuration.
- Prevent Admin initialization from running in client bundles.
- Reuse Admin app initialization safely across hot reloads/server requests.
- Restrict Admin usage to custom-token issuance in this milestone.

### WP3 — Trusted custom-token endpoint

- Implement `POST /api/auth/firebase-token`.
- Verify the Clerk server session on each request.
- Derive UID only from the verified Clerk `userId`.
- Reject unauthenticated callers; do not accept UID/email/org/workspace identity inputs from the request body.
- Return a Firebase custom token with no-cache headers and safe generic errors.
- Evaluate CSRF/origin and abuse/rate-limit protections as part of endpoint implementation.
- Never log tokens, credentials, or document content.

### WP4 — Client auth lifecycle

- Exchange the endpoint token using Firebase Client Auth custom-token sign-in.
- Synchronize Firebase Auth with Clerk sign-in/sign-out and account changes.
- Handle token refresh, retryable errors, and loading state.
- Avoid races and stale Firebase sessions during account switching.
- Keep org selection separate from user-level Firebase identity.

### WP5 — Tests and validation

- Add focused tests for token endpoint behavior, UID derivation, unauthenticated rejection, client auth lifecycle, and failure paths.
- Security checks must verify that caller-supplied identity fields are ignored/rejected and that Firebase UID maps to the Clerk user ID.
- Add integration coverage using Firebase Auth Emulator where practical.
- Existing test suite, lint, and production build must be run in a real CI/runtime environment before claiming acceptance.

## Proposed file layout

```
app/api/auth/firebase-token/route.js
config/firebaseAuth.js
lib/firebase-admin/admin.js
hooks/useFirebaseAuth.js       # if a dedicated hook is needed
docs/security/FIREBASE_AUTH_BRIDGE.md
tests/auth/firebase-bridge/
```

## Environment configuration

Existing variables include Clerk keys and Firebase web configuration. Implementation must reconcile the current `.env.sample` with the project configuration and avoid changing production environment values in this task.

Proposed server-side Admin credentials should be supplied through secure deployment environment configuration, not committed. Prefer the standard service-account fields (project ID, client email, private key) or an approved workload-identity approach. The private key must remain server-only and never use a `NEXT_PUBLIC_` prefix.

The existing Firebase configuration currently hardcodes project ID and app ID. Resolve that configuration inconsistency as a separate reviewed change within Stage A, using the existing deployed project values; do not guess or silently change project identity.

## Stages and approval gates

### Stage A — Infrastructure and configuration
- Add Firebase Admin dependency and Firebase Client Auth initialization.
- Document required server-side environment variables.
- Reconcile Firebase config values and variable naming.
- Update lockfile through npm in a real runtime; do not hand-edit lockfile.
- Do not change production environment variables or deploy.

**Exit criteria:** package and config changes are reviewed; lockfile is generated by npm; no production changes; CI checks are green.

### Stage B — Token endpoint
Implement the Clerk-verified custom-token endpoint, including response caching protections and reviewed abuse controls.

### Stage C — Auth lifecycle
Implement client synchronization, custom-token exchange, sign-out synchronization, and safe account-switch handling.

### Stage D — Integration and regression
Integrate into the app, test sign-in/sign-out and workspace/document flows, and run CI checks.

### Stage E — Acceptance
Review security behavior, failure modes, test coverage, and rollout readiness. No production rollout without explicit approval.

## Out of scope

- Firestore authorization schema or membership provisioning.
- Strict production Firestore Rules deployment.
- Data migration, deletion, or destructive edits.
- Credential rotation or production secret updates.
- Production deployment or rollout.
- Admin SDK Firestore access.

## Acceptance checklist

- [ ] UID is derived only from verified Clerk user ID.
- [ ] Admin SDK is server-only.
- [ ] Client Firebase Auth initialization reuses existing Firebase app.
- [x] Auth state synchronizes with Clerk including sign-out/account switch (Stage C; CI verified).\n- [ ] Firestore consumers gate reads/writes on bridge readiness and fail safely (Stage D).
- [ ] Token response is not cached and token/secret logging is absent.
- [ ] Caller-supplied identity cannot influence minted token.
- [ ] Focused tests and Firebase Auth Emulator coverage exist where feasible.
- [ ] Existing workspace/document functionality is preserved.
- [ ] CI (lint, tests, build) passes in a runtime.
- [ ] Production Rules/env/deploy/migration remain unchanged until separately approved.
