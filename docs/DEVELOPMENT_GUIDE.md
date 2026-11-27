# DEVELOPMENT GUIDE

**Project:** SyncSphere  
**Document Status:** Approved  
**Version:** 0.2  
**Document Type:** Developer Workflow & Engineering Guide  
**Approved By:** Evans Abraham (Project Owner)  
**Target Branch:** `agentic-development`  
**Parent Documents:** Project Charter v0.3 · Product Requirements v0.2 · Recovery Roadmap v0.2 · Technical Plan v0.2

## 1. Purpose

This guide establishes the practical development workflow for human contributors and AI agents. Work must be safe, reproducible, focused, testable, and traceable.

## 2. Development Environment

**Target environment:** Node.js 24 LTS (approved modernization target; verify the repository's actual baseline before assuming migration is complete), npm, Git, browser/device testing tools, and authorized service credentials only when needed.

Clone and switch to the recovery branch:

```bash
git clone https://github.com/EvansAbraham/SyncSphere.git
cd SyncSphere
git checkout agentic-development
npm ci
```

Use the committed lockfile. Do not switch package managers or regenerate it casually.

### Environment configuration
Inspect the existing sample file and source usage. Create local configuration with verified variable names and authorized credentials. Never invent variable names or commit secrets, local environment files, or private data.

## 3. Language and Code Conventions

- JavaScript ES6+, JSX, and MJS are approved and retained.
- TypeScript migration is P3/deferred and outside recovery scope.
- Follow established conventions where reasonable and keep style consistent.
- Prefer readable, maintainable modules and clear boundaries.
- Validate runtime data; type/syntax assumptions do not replace validation.
- Avoid unrelated refactors or speculative abstractions.

## 4. Canonical Commands

Inspect `package.json` before relying on scripts. Known commands:

| Purpose | Command |
|---|---|
| Clean install | `npm ci` |
| Development server | `npm run dev` |
| Lint | `npm run lint` |
| Production build | `npm run build` |
| Production server after build | `npm run start` |

A test command is not guaranteed to exist yet. Confirm the script and test tooling before running it. Missing, blocked, or failed checks must be recorded honestly; do not suppress failures to manufacture a green result.

## 5. Branch and Git Workflow

- `main`: production-bound; read-only during recovery.
- `agentic-development`: primary recovery/development branch.
- Feature branches: use for isolated work where helpful.

Before work, check branch, working tree, recent commits, scope, docs, and existing changes. Never overwrite, reset, discard, or amend user work without explicit authorization.

Example:
```bash
git checkout agentic-development
git checkout -b fix/editor-save-race
```

Commits should be focused and meaningful, with a reviewed diff. Suggested format: `type: concise description` (fix, feat, test, refactor, docs, chore). Do not commit secrets or generated clutter. No merge into `main`, production deployment, or production data change without explicit approval.

## 6. Task Workflow

1. **Define:** problem, outcome, scope, acceptance criteria, milestone, dependencies, and risks.
2. **Inspect:** read affected code, callers, data flow, conventions, tests, and behavior.
3. **Plan:** outline changes, verification, risks, and dependency modifications; keep proportional.
4. **Implement:** smallest focused solution, preserve behavior, validate boundaries, avoid unrelated cleanup.
5. **Verify:** run relevant tests, regressions, lint, build, manual/runtime and security checks.
6. **Review:** examine diff for correctness, scope, security, data integrity, compatibility, complexity, and test gaps.
7. **Report:** changes, files, checks/results, limitations, and commit details.

Stop and seek owner approval when scope, architecture, risk, or destructive impact exceeds authorization.

## 7. Test-Driven Development

Prefer **RED → GREEN → REFACTOR**:
- **RED:** reproduce the issue with a test that fails for the intended reason.
- **GREEN:** implement the smallest fix.
- **REFACTOR:** improve structure without changing verified behavior.

Add regression tests where practical. If TDD is impractical, explain why and still perform meaningful verification. Tests should be deterministic and avoid production data or credentials.

## 8. Code Quality

- Readable, explicit, maintainable JavaScript.
- Small focused modules/components.
- Reuse sound abstractions; add new ones only with clear value.
- Handle null, undefined, empty, invalid, and malformed states.
- Validate external, client, stored, and AI data.
- Avoid swallowed failures and preserve user content.
- Keep loading, empty, success, and error states accurate.
- Include accessibility and mobile usability in affected UI work.

## 9. Security and Data Protection

Security is continuous:
- Authenticate protected operations.
- Authorize resource access at trusted boundaries.
- Never trust client-provided ownership or permission claims.
- Keep secrets server-side and out of source control, bundles, logs, and screenshots.
- Treat client input, external responses, stored content, and AI output as untrusted.
- Do not weaken auth, rules, or validation to bypass defects.
- Do not execute destructive data operations or irreversible migrations without approval.
- Report discovered security issues promptly.

Explicit owner approval is required for destructive data changes, production changes, breaking migrations, feature removal, auth architecture changes, production deployment, significant costs, scope expansion, or high-impact security/privacy risks.

## 10. Dependencies and Configuration

Before adding, upgrading, or removing packages, establish the need and evaluate compatibility, maintenance, security, licensing, resource/bundle impact, and alternatives. Keep changes scoped; avoid mass upgrades. npm and `package-lock.json` are canonical; use `npm ci`. Document meaningful config changes. Do not guess secrets or environment variable names.

## 11. CI and Verification

Expected CI checks as established: clean install, lint, tests, build, and relevant security/regression checks. Verify each check ran. Do not disable checks, hide failures, or claim CI passed without evidence. A build alone does not prove end-to-end or production health.

Report check status as:
- **Passed** — executed and passed.
- **Failed** — executed and failed.
- **Blocked** — could not run due to a stated limitation.
- **Not run** — not attempted.

## 12. Documentation

Update docs when setup, commands, configuration, architecture, data behavior, APIs, workflows, recovery status, or limitations change. Keep docs lean and consistent; avoid duplicating approved sources of truth.

## 13. Agent Operating Rules

Agents must read `AGENTS.md`, verify branch/status, inspect before editing, respect approved scope, preserve existing features and user changes, test/report honestly, avoid unnecessary dependencies, and stop when approval is required.

Agents must not rewrite the project, invent repository facts or test results, conceal failures, expose secrets, remove features, perform destructive operations, deploy/merge production, or expand scope without approval.

## 14. Completion Report

**Task:** Objective.  
**Changes:** Summary and files affected.  
**Verification:** Checks with Passed/Failed/Blocked/Not run.  
**Limitations:** Unverified behavior, risks, blockers.  
**Git:** Branch, commit SHA, status when verified.  
**Status:** Completed / Partially completed / Blocked.

## 15. Definition of Done

Acceptance criteria met; scope preserved; tests added/updated as appropriate; relevant verification performed; regression risks and diff reviewed; docs updated; no failures concealed; status reported accurately. Work may be partial or blocked when evidence is incomplete.

## 16. Guide Maintenance

Adjust this guide when experience warrants it. Process must remain proportional. Material governance or agent-authority changes must align with Charter and `AGENTS.md`.

---

**End of Development Guide — Version 0.2 — Approved**
