# SyncSphere — Baseline Assessment

**Document:** `docs/BASELINE_ASSESSMENT.md`  
**Version:** 0.3  
**Status:** Approved  
**Assessment:** M0 Baseline & Repository Assessment  
**Branch:** `agentic-development`

## 1. Executive Summary

SyncSphere is a workspace and document application built with Next.js, Clerk, Firebase/Firestore, and Gemini. Source inspection and owner-led runtime validation confirm that the core normal-use workflow is functional: sign-in, workspace creation/navigation, document creation/editing, save/reload persistence, rename, and normal document/workspace deletion.

The most significant confirmed security finding is the deployed Firestore rules configuration allowing unrestricted reads and writes. Application route protection and client-side query filters do not replace database authorization. AI content generation also fails during runtime, and multiple UI/performance defects were observed.

**Baseline conclusion:** SyncSphere has a working prototype foundation, but security controls and failure-handling require remediation before it can be considered production-ready.

M0 is assessment only; it does not authorize remediation, production changes, or data migrations.

## 2. Scope and Method

Reviewed repository structure, framework/dependencies, routes and middleware, Firestore model/access patterns, Firebase Console configuration, AI integration, CI/test configuration, and application flows. The project owner performed live runtime checks on the deployed application and reported results.

Limitations: no local application execution; no penetration testing; no deliberate write-failure or network-failure tests; no complete browser/device/accessibility matrix; no formal performance measurements; dependency audit remains pending; no evidence of actual compromise was established.

## 3. Architecture Baseline

| Component | Current baseline |
|---|---|
| Runtime | Node.js |
| Framework | Next.js 14.2.13 |
| UI | React 18 |
| Language | JavaScript / JSX |
| Authentication | Clerk |
| Database | Cloud Firestore |
| Firebase SDK | 10.13.1 |
| AI SDK | Google Generative AI 0.19.0 |
| AI model | Gemini 1.5 Flash |
| Editor | Editor.js 2.30.6 |
| CSS | Tailwind CSS 3.4.1 |
| UI primitives | Radix UI |
| Package manager | npm |
| Deployment | Vercel |
| Tests | Vitest |
| CI | GitHub Actions |

Approved recovery target: Node 24 LTS, Next.js 16, React 19, JavaScript-first; retain existing core services where compatible. TypeScript migration is deferred to P3.

### Routes
- `/`
- `/sign-in`, `/sign-up`
- `/dashboard`
- `/createworkspace`
- `/workspace/[workspaceid]`
- `/workspace/[workspaceid]/[documentid]`

Clerk middleware protects dashboard and workspace routes. This route protection is not Firestore authorization.

## 4. Data Model

**Workspace** (`Workspace`): `workSpaceName`, `emoji`, `coverImage`, `createdBy`, `id`, `orgId`.

**Workspace document** (`workspaceDocuments`): `workspaceId`, `createdBy`, `coverImage`, `emoji`, `id`, `documentName`, `documentOutput`.

**Document content** (`documentOutput`): `docId`, `output`, `editedBy`. Editor content is stored as serialized Editor.js output. The application uses direct client-side Firestore SDK reads/writes.

## 5. Security Findings

### S-01 — Unrestricted Firestore rules (CONFIRMED / CRITICAL)
Deployed rules supplied during investigation contain `allow read, write: if true;` for matched documents. This permits unrestricted reads/writes at the rules layer, including unauthenticated access. Potential outcomes include data disclosure, unauthorized creation/modification/deletion, and tenant-boundary bypass. Actual exploitation, exposure, abuse, or loss is unknown.

**Priority P0.** Remediation requires deny-by-default rules with validated authentication, ownership, and tenant membership, plus rules tests. Do not alter deployed rules without explicit approval.

### S-02 — Data-layer authorization and tenant isolation (CONFIRMED)
Client-side org/user filters are not an authorization boundary. Reviewed resource access paths lacked an identified server-enforced membership/ownership check. **P0.**

### S-03 — Client-controlled ownership/tenant fields (CONFIRMED)
Fields including `createdBy`, `orgId`, and resource identifiers are supplied by client writes; with permissive rules they cannot establish trusted ownership. **P0.**

### S-04 — Clerk/Firebase identity bridge (NOT IDENTIFIED)
A Clerk-to-Firebase Auth bridge was not found in reviewed files. A trusted identity enforcement path for Firestore was not established. **P0 investigation/remediation.**

### S-05 — App Check missing/unenforced (CONFIRMED)
Firebase Console showed the web App Check registration absent and Firestore enforcement Unenforced. App Check is abuse resistance, not authorization. **P1.**

### S-06 — Gemini credential/client-side usage (CONFIRMED ARCHITECTURAL CONCERN)
Client code uses `NEXT_PUBLIC_GEMINI_API_KEY` with the Gemini SDK; public-prefixed client credentials cannot be treated as secret. The sample environment file uses `NEXT_GEMINI_API_KEY`, a naming mismatch. Misuse/billing abuse and key rotation status were not verified. **P0.**

## 6. Reliability and Data Integrity

- Workspace creation performs separate writes for workspace, document metadata, and initial output; partial failure can leave incomplete records. **Confirmed architectural risk; normal runtime creation passed.**
- Document creation also separates metadata/output writes. **Confirmed risk; normal creation passed.**
- Document deletion and workspace cascade deletion involve multiple operations and are not atomic; partial failures could leave orphaned records. **Confirmed risk; normal deletion passed.**
- Editor lifecycle/instance handling, listener cleanup, save-on-change behavior, overlapping writes, and persistence error recovery have weaknesses identified by source inspection. **Potential risks; no data loss or race reproduced.**
- Metadata read/update paths have limited explicit error handling and may have stale/loading states. **Source concern; runtime rename passed.**

## 7. AI Baseline

AI template/content generation **fails at runtime**, with a response parsing/format error reported by the user. The precise cause remains unknown.

Source review found direct JSON parsing assumptions, shallow validation (presence of `blocks` array), no comprehensive Editor.js block schema validation, and generic error handling that may mask API, network, credential, model, or formatting errors. Client-side credential handling is a separate security concern.

Remediation direction: server-side AI request handling, output schema validation, safe insertion, categorized diagnostics, timeout/retry boundaries, and tests for valid/invalid output and API failures.

## 8. Runtime Validation

Owner-conducted tests on the running application:

| Flow | Result |
|---|---|
| Landing page/navigation and sign-in | Pass |
| Dashboard load | Pass |
| Workspace creation and opening | Pass |
| Document creation | Pass |
| Editor typing/save | Pass |
| Reload and persistence | Pass |
| Rename and reopen | Pass |
| Normal document deletion | Pass |
| Normal workspace deletion | Pass |
| AI content generation | Fail |
| Dashboard grid/list switch | Defect confirmed by source: icons are inert; grid is hardcoded |
| Mobile editor layout | AI floating button overlaps toolbar |
| Delete UI synchronization | Deleted item remains briefly visible until refresh |
| General navigation/layout | No additional issues reported |

Runtime tests verified ordinary success paths; failure paths and destructive edge cases were not intentionally triggered.

## 9. UX and Performance

Confirmed: nonfunctional grid/list controls, mobile AI-button/toolbar overlap, transient stale document entry after deletion, slow cover-picker image loading, and intermittent slowness reported by the user.

Performance causes are not isolated or benchmarked. Source review also flagged potential workspace-name overflow, fixed sidebar/editor constraints, missing accessible labeling in reviewed icon-only controls, and keyboard/focus/contrast/screen-reader coverage gaps. No formal accessibility audit was performed.

## 10. CI and Tests

Unified GitHub Actions pipeline includes Node 24, lock synchronization, `npm ci`, ESLint, Vitest, build, and lockfile automation where applicable. A prior successful run was observed for workflow #32 attempt 2 at SHA `18a75aa`. Later lockfile SHA `11ff7c4` had no separate confirmed CI result in the earlier investigation.

Reviewed test coverage is minimal (CoverOption tests checking list presence, HTTPS URLs, and uniqueness). Auth, Firestore rules, tenant isolation, CRUD failure paths, editor lifecycle/persistence errors, AI output, accessibility, and responsive flows lack meaningful coverage.

No local test execution was available during M0. Full dependency audit is pending.

## 11. Feature Scope

Existing: authentication, workspace management, document CRUD, Editor.js editing/persistence, AI generation workflow (currently failing).

Planned, not current defects: PDF export. Conflict-free collaboration (CRDT/OT/presence) was not verified and is outside the established charter scope. TypeScript is deferred to P3.

## 12. Priorities

- **P0:** Firestore rules, data-layer auth/tenant isolation, trusted ownership, Gemini credential handling.
- **P1:** App Check; AI reliability/validation; atomic/consistent writes/deletes; editor lifecycle and persistence recovery; meaningful tests; dependency audit; config validation.
- **P2:** Grid/List, mobile editor layout, stale delete UI, image loading/performance, accessibility, error/loading states, CI verification.
- **P3:** TypeScript and broader deferred modernization.

## 13. M0 Exit Checklist

| Item | Status |
|---|---|
| Architecture/source investigation | Complete |
| Firebase config review | Complete |
| Security baseline | Complete |
| AI/source review | Complete |
| CI/test review | Complete |
| Normal runtime CRUD walkthrough | Complete |
| Runtime defect inventory | Complete |
| Mobile observations | Complete |
| Dependency audit | Pending |
| Deeper failure-path tests | Pending |
| Risk register | Draft v0.3 prepared |
| Owner review | Approved |

## 14. Exit Assessment

Normal core workflows work in the tested runtime environment, but the unrestricted Firestore rules are a critical security exposure. Authorization boundaries, client-side Gemini credential exposure, AI runtime failure, multi-operation data integrity, editor reliability, and limited testing remain material.

M0 assessment is complete for the scoped investigation, with explicit audit/failure-path limitations carried forward as open items. This is not a security certification or production-readiness declaration.

No remediation, production rule change, deployment, migration, or data deletion is authorized by this assessment.
