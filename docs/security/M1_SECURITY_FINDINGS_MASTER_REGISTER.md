# M1 Security Findings & Technical Debt Master Register

> Central tracking register for security findings, reliability risks, CI/build warnings, and deferred technical debt discovered during M1 security modernization. This register is a baseline, not an assertion that the repository audit is exhaustive.

## Purpose and operating rules

- Prioritize primary security, authorization, data-integrity, and functional blockers before non-blocking warning cleanup.
- Assign a stable finding ID to every discovered issue and keep its evidence, disposition, and verification recorded here.
- Do not silently dismiss warnings. Deferred findings must have a reason and remain visible for later review.
- Scope fixes to one finding/work package at a time; avoid opportunistic cleanup.
- A finding is not marked **Verified** or **Closed** until evidence supports the resolution.
- Reassess priority based on actual exposure and impact; source warning severity and project priority are not automatically identical.
- Production deployments, production data mutations, Firestore Rules changes, environment changes, and migrations require explicit approval.

## Priority definitions

| Priority | Meaning | Typical response |
|---|---|---|
| P0 — Critical | Active exploitation, severe exposure, or critical security/data failure | Immediate triage; stop unsafe progression |
| P1 — High | Security boundary, authorization, identity, or data-integrity issue that blocks safe progression | Address before dependent work proceeds |
| P2 — Moderate | Significant reliability, hardening, architecture, or maintainability concern | Schedule after primary blockers or when dependency requires it |
| P3 — Low | Non-blocking quality, cleanup, or minor warning | Defer until primary work is stable; then address one at a time |

## Status definitions

Open · Investigating · In Progress · Blocked · Deferred · Fixed (unverified) · Verified · Closed


## Findings

### F-001 — Autosave queue dropped edits while a save was active
- **Source:** Code review / data-integrity investigation
- **Affected component:** RichTextEditor autosave flow; `lib/document-autosave.js`
- **Impact:** Edits arriving during an active save could be discarded.
- **Priority:** P1
- **Status:** Verified
- **Resolution:** Queue/coalesce subsequent edits and run another save after the active save finishes; dispose and activity guards added.
- **Evidence:** Commit `a66e9fb22662279f8077d97768bef36faa06bf2c`; CI run #123, ID `46159579020` — https://github.com/EvansAbraham/SyncSphere/actions/runs/46159579020
- **Verification:** CI passed (autosave test suite included).
- **Residual risk:** In-flight Firestore writes cannot be cancelled by the helper; editor snapshot/lifecycle and auth-loss races remain under review.

### F-002 — Workspace cascade deletion used unbounded individual child deletes
- **Source:** Code review / data-integrity investigation
- **Affected component:** `app/(routes)/dashboard/_components/WorkSpaceListItem.jsx`
- **Impact:** Large cascades and parallel individual deletes could fail partially and leave inconsistent records.
- **Priority:** P1
- **Status:** Verified (bounded-batch improvement; residual risks remain)
- **Resolution:** Sequential chunks of up to 200 metadata IDs; each chunk atomically deletes paired metadata/output records (400 operations); parent deletion occurs only after all child chunks succeed.
- **Evidence:** Commit `586e2114285832f9fad9a0e1c30dcfc1ba4cdada`; CI run #128, ID `46160412629` — https://github.com/EvansAbraham/SyncSphere/actions/runs/46160412629
- **Verification:** CI passed; 7 test files / 29 tests passed; production build completed.
- **Residual risk:** Cascade across multiple chunks is not globally atomic. Concurrent child creation after the initial query may race deletion; orphan outputs without corresponding metadata may not be discoverable through the current query. Failure retains the parent for retry, but retry behavior is helper-tested rather than a full Firestore integration test.

### F-003 — Firestore authorization Rules implementation is pending
- **Source:** Security architecture review
- **Affected component:** Firestore data access and security rules
- **Impact:** Client-side identity/authorization controls alone are insufficient to enforce access.
- **Priority:** P1
- **Status:** Blocked / implementation pending
- **Resolution plan:** Finalize policy decisions and bridge integration readiness, then implement/test deny-by-default Rules in a separately approved work package.
- **Evidence:** `docs/security/FIRESTORE_AUTHORIZATION_DESIGN.md` (approved design; implementation not performed).

### F-004 — Workspace deletion can race concurrent document creation
- **Source:** Cascade-delete review
- **Affected component:** Workspace deletion and document creation flows
- **Impact:** Concurrent creates during multi-batch deletion may leave child records or inconsistent state.
- **Priority:** P1 pending assessment
- **Status:** Open
- **Resolution plan:** Evaluate deletion-state coordination and server/rules enforcement; do not change schema or Rules without approval.
- **Evidence:** WP-07A review, commit `586e2114285832f9fad9a0e1c30dcfc1ba4cdada`.

### F-005 — Editor lifecycle, snapshot, and auth-loss races remain
- **Source:** Stage D review
- **Affected component:** RichTextEditor/editor session lifecycle and Firestore listeners/writes
- **Impact:** State changes or writes may race component lifecycle or authentication transitions.
- **Priority:** P1/P2 pending assessment
- **Status:** Open / under review
- **Resolution plan:** Review the remaining lifecycle/snapshot race scenarios; add targeted tests and fix within a bounded work package.
- **Evidence:** Autosave fix residual-risk review; CI #123.
- **Stage D source review (2026-11-28):** confirmed the initial Firestore snapshot may render after editor readiness and replace early unsaved edits while autosave is gated on `isFetchedRef`; subsequent remote snapshots may also render over local pending edits without a dirty-state guard. Existing cleanup disposes the queue/listener, but an already-started Firestore write cannot be cancelled. These are source-level risks; no production loss observed or code changed during this review.

### F-006 — Broader Firestore consumer inventory is incomplete
- **Source:** Security audit
- **Affected component:** Application-wide Firestore client consumers
- **Impact:** Unreviewed consumers may have authorization assumptions or unsafe data access patterns.
- **Priority:** P1
- **Status:** Open
- **Resolution plan:** Complete a systematic inventory of Firestore reads/writes/listeners and classify them against trusted identity and planned Rules.
- **Evidence:** M1 audit notes; earlier inventory was partial and must not be treated as complete.

### F-007 — Gemini API key protection and server-side isolation is deferred
- **Source:** Security modernization scope
- **Affected component:** Gemini integration/API-key handling
- **Impact:** Client exposure or insufficient server-side controls may risk API abuse and credential leakage.
- **Priority:** P1 pending exposure verification
- **Status:** Deferred
- **Resolution plan:** Inspect current key usage and move sensitive calls/credential handling behind appropriate server boundaries; verify with bundle/runtime checks.
- **Evidence:** M1 plan/WP-05 deferred status. No fix or release-readiness claim recorded.

### F-008 — Anonymous default export lint warning in CoverOption
- **Source:** CI / ESLint
- **Affected component:** `app/_shared/CoverOption.js`
- **Impact:** Minor code-quality warning; anonymous default export reduces clarity.
- **Priority:** P3
- **Status:** Open / Deferred
- **Resolution plan:** Name the exported component/function in a dedicated cleanup work package.
- **Evidence:** CI #128 log; one existing ESLint warning.

### F-009 — Raw `<img>` triggers Next.js image optimization warning
- **Source:** CI / production build
- **Affected component:** Image rendering site(s), not yet exhaustively inventoried
- **Impact:** Missed optimization opportunity and possible performance concern; not established as a security issue.
- **Priority:** P3
- **Status:** Open / Deferred
- **Resolution plan:** Identify affected usage and decide whether Next Image or documented exception is appropriate.
- **Evidence:** CI #128 production-build log.

### F-010 — Deprecated `punycode` usage in dependency chain
- **Source:** CI / Node runtime warning
- **Affected component:** Dependency chain (specific package/path not yet identified)
- **Impact:** Maintenance/deprecation risk; exposure and ownership not yet assessed.
- **Priority:** P3 pending assessment
- **Status:** Open / Deferred
- **Resolution plan:** Trace dependency path and assess update/removal options after primary security work.
- **Evidence:** CI #128 production-build log.

### F-011 — Deprecated `url.parse()` usage reported by dependency/build output
- **Source:** CI / Node runtime warning
- **Affected component:** Dependency or runtime code (exact source not yet traced)
- **Impact:** Deprecated parsing API; warning itself does not establish a vulnerability in application code.
- **Priority:** P2/P3 pending assessment
- **Status:** Open / Deferred
- **Resolution plan:** Trace the callsite/package, assess security relevance, and schedule a targeted fix if warranted.
- **Evidence:** CI #128 production-build log.

### F-012 — GitHub Actions Node 20 runtime deprecation notice
- **Source:** CI / GitHub Actions runtime notice
- **Affected component:** Workflow actions/runtime compatibility
- **Impact:** Future CI compatibility/maintenance risk if action runtime support is removed.
- **Priority:** P3
- **Status:** Open / Deferred
- **Resolution plan:** Review action versions and upgrade compatible actions in a dedicated workflow-maintenance pass.
- **Evidence:** CI #128 job log reported the Node 20 action-runtime deprecation notice while the job itself ran under Node 24 for project setup/build.

### WP-07A checklist reconciliation (2026-11-28)
- Temporary M1 checklist updated to reflect WP-07A bounded-batch cascade remediation and CI evidence #128; residual risks remain explicitly open.
- Stage D progress notes reconciled: autosave remediation (#123) and WP-07A (#128) are verified, but editor snapshot sequencing, auth-loss/in-flight write behavior, lifecycle/listener cleanup, and broader Firestore consumer coverage remain outstanding.
- Documentation update is bookkeeping only; no code, Rules, environment, data, or deployment changes.

## Evidence baseline

| Evidence | Result | Notes |
|---|---|---|
| CI #123 — https://github.com/EvansAbraham/SyncSphere/actions/runs/46159579020 | Passed | Autosave queue remediation verified in CI |
| CI #128 — https://github.com/EvansAbraham/SyncSphere/actions/runs/46160412629 | Passed | 7 test files / 29 tests; ESLint and production build succeeded; warnings above remain non-blocking |

## Recommended order of work

1. Resolve primary security blockers and authorization/data-integrity dependencies (F-003, F-006, F-007, with sequencing based on architecture and exposure review).
2. Continue Stage D editor lifecycle/snapshot/auth-loss review (F-005), keeping workspace-deletion race risk (F-004) visible.
3. Complete broader Firestore consumer inventory (F-006) before Rules implementation/release readiness.
4. After primary security/stability work is complete, revisit P2/P3 warnings in this register one at a time, tracing each warning before changing code.

## Register maintenance history

- **Initial baseline:** Seeded from existing M1 reviews and CI evidence #123 and #128. This is intentionally a partial inventory; more findings will be added as the audit proceeds.
