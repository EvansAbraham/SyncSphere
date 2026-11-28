# SyncSphere — Risk Register

**Document:** `docs/RISK_REGISTER.md`  
**Version:** 0.5  
**Status:** Approved  
**Assessment:** M0  
**Branch:** `agentic-development`
**Approved By:** Evans Abraham
**Approval Date:** 2026-11-28

> Earlier draft discussions did not contain assigned numeric IDs. IDs below are newly established in this version, not a claim of continuity. Risk IDs are stable from v0.3 onward unless formally changed.

## 1. Scoring

Qualitative ratings: **Critical**, **High**, **Medium**, **Low**. Confidence describes evidence strength, not likelihood. Status distinguishes confirmed conditions from potential risks and unknowns.

## 2. Register

| ID | Priority / Rating | Status / Confidence | Risk & Evidence | Mitigation |
|---|---|---|---|---|
| SS-R01 | P0 / Critical | Confirmed / High | Firestore deployed rules permit unrestricted read/write (`if true`). Actual exploitation is unknown. | Deny-by-default rules; auth/tenant/ownership validation; rules tests. Explicit approval required before changing deployed rules. |
| SS-R02 | P0 / Critical | Confirmed / High | Client-side query filters are not DB authorization; reviewed resource paths lack verified server-side membership enforcement. | Enforce resource authorization at rules or trusted server layer; test cross-tenant access. |
| SS-R03 | P0 / Critical | Confirmed / High | Ownership/tenant metadata (e.g., `createdBy`, `orgId`) is client-supplied and cannot be trusted under current rules. | Validate trusted identity/claims and field invariants; reject unauthorized changes. |
| SS-R04 | P0 / High | Confirmed concern / High | Gemini SDK is used in client code with public-prefixed key; potential credential misuse/quota/billing abuse. Exposure impact beyond architecture not verified. | Move requests server-side, restrict/rate-limit, monitor, assess rotation. |
| SS-R05 | P1 / High | Config gap confirmed / High | App Check web registration absent; Firestore enforcement Unenforced. | Register/integrate App Check and gradually enforce after validation; remember it is not authorization. |
| SS-R06 | P1 / High | Runtime failure / High on failure, low on cause | AI generation fails with parse/format error; root cause undiagnosed. | Server handler, structured output, validation, classified errors, timeout/retry tests. |
| SS-R07 | P1 / High | Architectural risk / High | Workspace creation comprises multiple writes; partial completion could leave records. Normal creation passed. | Transaction/batch strategy or compensating recovery; failure-path tests. |
| SS-R08 | P1 / High | Architectural risk / High | Document creation writes metadata/output separately; partial completion possible. Normal creation passed. | Atomic/reliable write design and repair handling; tests. |
| SS-R09 | P1 / High | Architectural risk / High | Document/workspace deletions span multiple writes; partial cascades could orphan records. Normal deletion passed. | Safe cascade strategy, batches/transactions where suitable, deletion-state/repair logic, tests. |
| SS-R10 | P1 / High | Potential / Medium | Editor lifecycle and save-on-change may allow races, stale writes, or resource leaks; none reproduced. | Stable lifecycle, cleanup, debounce/serialization, dirty/save state, failure tests. |
| SS-R11 | P1 / High | Design weakness / High | AI output validation checks shallow shape rather than supported Editor.js schemas. | Validate block types/data, sanitize/untrusted output, reject invalid payloads, test. |
| SS-R12 | P1 / Medium–High | Source concern / Medium–High | Generic/limited error handling across AI and selected data flows may hide failure causes. | Categorized errors, safe diagnostic logs, actionable UI, retry boundaries and tests. |
| SS-R13 | P2 / Medium | Runtime defect / High | Deleted document briefly remains visible until refresh; cause not isolated. | Update/invalidate local UI state or synchronize listener correctly; deletion status/error handling. |
| SS-R14 | P2 / Medium | Runtime/source confirmed / High | Dashboard Grid/List controls are inert; grid hardcoded. | Implement stateful view toggle, list layout, accessible active state. |
| SS-R15 | P2 / Medium | Runtime confirmed / High | Mobile floating AI button overlaps editor toolbar. | Responsive positioning that respects toolbar and safe viewport. |
| SS-R16 | P2 / Medium | Performance observation / High for observation, low for cause | Cover-picker thumbnails load slowly; source uses multiple remote thumbnails. Cause not measured. | Benchmark; optimize thumbnails, loading, caching, placeholders; evaluate virtualization/pagination. |
| SS-R17 | P2 / Medium | User observation / Medium | Intermittent slowness in some interactions, no traces/measurements. | Instrument and benchmark rendering, requests, image loading, and latency before optimizing. |
| SS-R18 | P1 / High | Coverage gap confirmed / High | Minimal automated tests; auth, rules, CRUD, editor, AI, failure paths largely untested. | Add unit/integration/rules/CRUD/AI/persistence tests tied to milestones and CI. |
| SS-R19 | P1 / High | Audit pending / High that audit is outstanding; vulnerability status unknown | Full dependency audit not run; vulnerable dependencies may exist, but none asserted. | Run audit, triage findings, plan compatible upgrades. |
| SS-R20 | P2 / Medium | Partial assessment / Medium | Keyboard, focus, contrast, screen-reader and cross-device behavior not comprehensively verified; some icon-only labeling concerns. | Accessibility audit and remediation; responsive/device/keyboard tests. |
| SS-R21 | P1 / Medium | Discrepancy confirmed / High; runtime impact unknown | Firebase env sample and source naming differ; some project/app identifiers hardcoded. | Canonical env config, startup validation, remove unnecessary hardcoding, verify deployments. |
| SS-R22 | P2 / Medium | Verification pending / High | CI success seen for SHA `18a75aa`; later branch SHA `11ff7c4` lacked separate confirmed run in prior review. | Confirm CI green at current branch SHA before next milestone. |
| SS-R23 | P2 / Low–Medium | Source concern / High | Landing page placeholder text and unverified marketing claims; unfinished navigation. | Replace with accurate content and working destinations or remove placeholders. |
| SS-R24 | P1 / Medium | Investigation pending / Medium | The configured Gemini model may be outdated, unsupported, deprecated, or incompatible with current SDK/API expectations; exact model ID and lifecycle state have not yet been reverified. | Identify the model and SDK; verify official provider lifecycle/compatibility documentation; evaluate supported candidates for quality, structured output, latency, cost, and reliability; document selection and regression-test migration. |

## 3. Priority Summary

- **P0:** SS-R01–SS-R04 — Firestore exposure, authorization/tenant boundaries, trusted ownership, Gemini credential protection.
- **P1:** SS-R05–SS-R12, SS-R18–SS-R19, SS-R21, SS-R24–SS-R28 — App Check, AI availability/validation/model lifecycle, data consistency, editor reliability, diagnostics, tests, audit, configuration, retrieval isolation, prompt injection, usage governance, and AI evaluation.
- **P2:** SS-R13–SS-R17, SS-R20, SS-R22–SS-R23 — UI synchronization, view toggle, mobile layout, performance, accessibility, CI verification, landing content.
- **P3 / deferred:** TypeScript and wider platform/architecture modernization, per approved roadmap.

## 4. Immediate Recovery Blockers

Before claiming production-ready recovery:

1. Replace permissive Firestore rules with tested authorization controls.
2. Define and verify data-layer identity, ownership, and tenant isolation.
3. Move Gemini requests and credential handling to a server-side architecture.
4. Complete dependency vulnerability audit and triage.
5. Verify CI at latest approved branch commit.
6. Add meaningful security and critical workflow tests.
7. Validate remediation in staging before any production configuration/deployment changes.

## 5. Open Investigation Notes

- AI generation root cause remains unknown.
- Gemini model ID/support/deprecation status has not yet been rechecked; model modernization is scheduled for M3 AI stabilization.
- Partial-write and deletion failure behavior not tested deliberately.
- Save concurrency/race behavior not reproduced.
- Performance has no quantitative baseline.
- No actual data compromise or abuse was confirmed.
- App Check does not substitute for authentication/authorization.
- PDF export is planned, not a current defect.
- Conflict-free collaboration is not verified and remains outside current charter scope.
- TypeScript is deferred to P3.

## 6. AI Modernization Roadmap Alignment

Broader AI evolution is governed by the approved [AI Modernization & Evolution Roadmap](AI_MODERNIZATION_ROADMAP.md) v0.1. The new risks SS-R25–SS-R28 are potential risks for future RAG, retrieved-context workflows, governance, and evaluation; they are not claims that these capabilities currently exist or that exploitation has occurred. Address them during the relevant approved work packages.

## 7. Approval and Change Control

This register is approved as M0 v0.5. Evans Abraham approved these documentation updates for `agentic-development` on 2026-11-28. This approval does not authorize production rule changes, migrations, deployment, or deletion of user data.

Risk changes should preserve these IDs; additions receive new IDs, and reclassification should be recorded in subsequent versions.
