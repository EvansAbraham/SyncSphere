# AGENTS.md

**Project:** SyncSphere  
**Document Status:** Approved  
**Version:** 0.2  
**Document Type:** Repository Agent Instructions  
**Location:** Repository Root  
**Approved By:** Evans Abraham (Project Owner)

## 1. Project Context

SyncSphere is an existing collaborative workspace/document app undergoing recovery, stabilization, security improvements, and modernization. This is not a greenfield rewrite. Preserve existing features and data unless changes/removal are explicitly approved.

## 2. Approved Stack Direction

- **Runtime target:** Node.js 24 LTS.
- **Framework target:** Next.js 16 (App Router).
- **UI target:** React 19.
- **Language:** JavaScript ES6+, JSX, MJS retained.
- **Package manager:** npm.
- **Authentication:** Clerk.
- **Data:** Firebase / Firestore.
- **Editor:** Editor.js pending compatibility/maintenance assessment.
- **AI:** Gemini, server-side only.
- **Styling:** Tailwind CSS and Radix UI, compatibility evaluated.
- **Hosting:** Vercel.

Targets are not proof of installed/current versions. Verify exact versions and configuration before working. No TypeScript migration during recovery; it is P3/deferred.

### Package management
Use npm exclusively and `npm ci` for clean lockfile installs. Do not casually regenerate the lockfile or switch to yarn/pnpm.

### Commands
Inspect `package.json` first. Known scripts include `npm run dev`, `npm run build`, `npm run start`, and `npm run lint`; verify availability/configuration. A test script is not assumed. Report missing, blocked, or failed checks honestly.

## 3. Security Invariants

### Server-side AI
All Gemini requests run server-side. Credentials must never be client-exposed, use `NEXT_PUBLIC_*`, committed, returned to the browser, or included in client bundles. AI endpoints require authentication, authorization for private context, validation, abuse controls, and safe error handling.

### Identity and authorization
Clerk is the identity provider. Authenticate and authorize all protected operations. Verify workspace ownership/membership and document relationships for reads, creates, updates, and deletes. Never trust client-supplied identifiers or permissions alone. Authentication is not blanket authorization; deny by default if access cannot be verified.

### Environment and secrets
Never commit `.env`, credentials, private config, or real user data. Use sample files with placeholders. Confirm variable names from source/config; do not invent them. Investigate sample/code discrepancies. Keep secrets out of bundles, logs, screenshots, and docs.

### Data integrity
Validate data at boundaries. Prevent stale saves, duplicate mutations, orphaned records, and silent content loss. Protect existing content. Destructive operations and migrations require owner approval.

## 4. Architecture and Engineering Boundaries

Keep Next.js app structure and logical separation between presentation, validation/business logic, data access, auth, and AI orchestration. Keep handlers focused. Avoid unnecessary abstractions, dependencies, services, or wholesale restructuring. JavaScript/JSX/MJS is canonical during recovery; do not introduce TS migration.

## 5. Source of Truth

Consult relevant approved docs:
- `docs/PROJECT_CHARTER.md` — mission, scope, governance.
- `docs/PRODUCT_REQUIREMENTS.md` — product scope and acceptance.
- `docs/RECOVERY_ROADMAP.md` — milestones and gates.
- `docs/TECHNICAL_PLAN.md` — technical direction.
- `docs/DEVELOPMENT_GUIDE.md` — workflow and verification.

If docs conflict, identify the discrepancy; do not silently override approvals or expand scope.

## 6. Branch Safety

- `main`: production-bound, read-only during recovery.
- `agentic-development`: primary recovery branch.
- Use feature branches when useful.
- Verify active branch and working tree before edits.
- Never merge, deploy, or alter production configuration without explicit authorization.

## 7. Mandatory Inspection

Inspect affected files, callers, data flow, dependencies, conventions, tests, and behavior before changing code. Establish a baseline where practical. No blind edits or speculative rewrites.

## 8. Scope Discipline

Work only within approved scope. Preserve existing functionality and user changes. Avoid unrelated cleanup, broad rewrites, feature removal, and dependency churn. Ask approval before significant architectural changes, breaking behavior, migrations, paid services, scope expansion, or high-impact risks.

## 9. Engineering Practices

Prefer TDD (RED → GREEN → REFACTOR). Add/update tests and regression coverage as appropriate. Validate external/client/stored/AI data. Handle failures visibly and preserve content. Keep changes focused and reviewable.

## 10. CI and Verification

Target CI checks: Node 24, `npm ci`, lint, tests, build, and relevant security/regression checks. CI implementation is separate work. Confirm each check ran; distinguish Passed, Failed, Blocked, Not run. Never fabricate results, hide failures, or equate a build with full validation.

## 11. Git Discipline

Use focused commits with clear messages. Review diffs and exclude secrets, generated clutter, and unrelated changes. Never force-push, rewrite shared history, or amend without authorization. Commit/push only when explicitly authorized by task.

## 12. Owner Approval Required

Stop for approval before feature removal/material behavior change, major architecture or stack changes beyond approved target, breaking/destructive migrations, production data/config/deployment, paid services or significant cost, scope/acceptance changes, material security/privacy/data-loss risks, or consequential ambiguity.

## 13. Completion Report

Report summary, changed files, checks and actual results, limitations, branch/commit details, and follow-up. Do not claim full completion when significant verification remains.

## 14. Operating Principle

Act as a careful engineering agent, not project owner: inspect first, follow scope, protect behavior and data, verify before claiming, and ask before crossing approval boundaries.

**The Project Owner retains final authority over scope, architecture, and high-impact decisions.**
