# DEVELOPMENT GUIDE

**Project:** SyncSphere  
**Document Status:** Approved  
**Version:** 0.1  
**Document Type:** Developer Workflow & Engineering Guide  
**Approved By:** Evans Abraham (Project Owner)  
**Target Branch:** `agentic-development`  
**Parent Documents:** Project Charter v0.2 · Product Requirements v0.1 · Recovery Roadmap v0.1 · Technical Plan v0.1

---

## 1. Purpose

This document establishes the practical development workflow for contributing to, recovering, testing, and maintaining SyncSphere.

It defines the expected workflow for developers and AI agents, including repository setup, task execution, testing, Git practices, and reporting.

The goal is to make work reproducible, safe, traceable, and focused on delivering verified improvements.

---

## 2. Development Environment

### 2.1 Prerequisites

The development environment must provide:

- Node.js compatible with the project's actual dependency requirements.
- npm.
- Git.
- A supported browser for application verification.
- Appropriate development environment configuration when required.

Exact Node.js versions and environment requirements must be verified against the repository configuration during baseline assessment rather than guessed.

### 2.2 Installation

Clone the repository and enter the project directory:

```bash
git clone https://github.com/EvansAbraham/SyncSphere.git
cd SyncSphere
```

Switch to the recovery branch:

```bash
git checkout agentic-development
```

Install dependencies reproducibly:

```bash
npm ci
```

Do not use a different package manager or regenerate the lockfile casually.

### 2.3 Environment Configuration

1. Inspect the existing environment variable requirements.
2. Review the repository's `.env.example` if present.
3. Create a local environment file using verified variable names.
4. Populate credentials through authorized sources.
5. Never commit real secrets or local environment files.

Do not invent credentials, variable names, or Firebase/Clerk/Gemini configuration values.

---

## 3. Canonical Commands

Use npm and the project's existing scripts as the standard workflow.

| Purpose | Command |
|---|---|
| Clean dependency install | `npm ci` |
| Development server | `npm run dev` |
| Lint | `npm run lint` |
| Tests | `npm test -- --run` |
| Production build | `npm run build` |

### Command Rules

- Inspect `package.json` before relying on a command.
- If the lint or test script is unavailable, report it and avoid introducing tooling merely to make a command exist.
- If a command fails, report its failure and relevant diagnostics.
- Do not describe skipped or blocked commands as passing.
- Do not suppress failures merely to produce a successful result.
- Use focused tests during iteration and the required verification suite before completing a task.

---

## 4. Branch & Git Workflow

### 4.1 Branch Structure

| Branch | Purpose |
|---|---|
| `main` | Production-bound branch |
| `agentic-development` | Primary recovery and development branch |
| Feature branches | Isolated, scoped implementation work when appropriate |

### 4.2 Before Starting Work

Always verify:

- Current branch.
- Working tree status.
- Recent commits.
- Existing changes.
- Task scope.
- Relevant documentation.
- Whether the task depends on unfinished work.

Do not overwrite, discard, reset, or modify existing user changes.

### 4.3 Feature Branches

Use a feature branch when isolation would materially improve safety or reviewability.

Example:

```bash
git checkout agentic-development
git checkout -b fix/editor-save-race
```

Branch names should be descriptive, lowercase, and use hyphens.

When the work is complete, review the diff and verification results before integration.

Do not merge into `main` or deploy without explicit owner approval.

### 4.4 Commit Practices

Commits should:

- Represent one logical change.
- Use descriptive messages.
- Avoid unrelated modifications.
- Include appropriate tests.
- Exclude secrets and generated clutter.

Recommended commit message format:

```
type: concise description
```

Examples:

```text
fix: prevent stale document save overwrites
test: cover workspace authorization boundaries
docs: clarify local development setup
refactor: isolate document persistence logic
```

Common types:

- `fix` — bug correction.
- `feat` — approved feature.
- `test` — tests.
- `refactor` — internal restructuring without intended behavior change.
- `docs` — documentation.
- `chore` — maintenance.

Commit only when the task is complete enough to form a coherent, reviewable change and its status is understood.

---

## 5. Task Execution Workflow

Every engineering task follows a consistent process.

### Step 1 — Define

Establish:

- Problem statement.
- Expected outcome.
- Scope.
- Acceptance criteria.
- Relevant recovery milestone.
- Dependencies and risks.

Avoid implementing vague tasks without clarifying the intended behavior.

### Step 2 — Inspect

Before changing code:

- Read affected files.
- Trace relevant execution paths.
- Inspect callers and dependencies.
- Understand existing behavior.
- Identify adjacent regression risks.
- Review existing tests.

Do not assume the reported issue describes the complete root cause.

### Step 3 — Plan

Prepare a concise implementation plan that includes:

- Files or areas expected to change.
- Proposed approach.
- Tests to add or update.
- Risks.
- Any necessary dependency or configuration changes.

Keep the plan proportional to the task. Small fixes do not require lengthy plans.

### Step 4 — Implement

- Follow established repository conventions.
- Keep changes focused.
- Avoid unrelated refactoring.
- Preserve existing features.
- Prefer simple and maintainable solutions.
- Validate data at appropriate boundaries.
- Maintain clear separation of concerns.

### Step 5 — Verify

Run appropriate checks:

- Targeted tests.
- Related regression tests.
- Lint.
- Build.
- Runtime or browser verification when available.
- Security checks for security-related changes.

Verification must match the change. A passing unit test alone does not prove a full workflow works.

### Step 6 — Review

Review the resulting diff for:

- Correctness.
- Unintended changes.
- Security concerns.
- Data integrity risks.
- Compatibility.
- Unnecessary complexity.
- Missing tests.
- Documentation changes.

### Step 7 — Report

Provide a concise completion report covering:

- What changed.
- Files affected.
- Tests and checks run.
- Verification results.
- Remaining risks or limitations.
- Commit details, if committed.

If blocked, explain the blocker and the safest next step instead of improvising outside scope.

---

## 6. Test-Driven Development

TDD is preferred for bug fixes and new behavior when practical.

### RED — Reproduce

Create or identify a test that demonstrates the bug or missing behavior.

Confirm that it fails for the expected reason rather than because of broken setup.

### GREEN — Fix

Implement the smallest change needed to satisfy the test.

Avoid unrelated changes while correcting the behavior.

### REFACTOR — Improve

Improve readability, structure, or duplication while maintaining passing tests.

### Regression Protection

A fix should include regression coverage where practical so the same defect is less likely to return.

If strict TDD is impractical, document why and still provide meaningful verification.

---

## 7. Code Quality Standards

### 7.1 General

- Write clear, readable code.
- Prefer explicit behavior over unnecessary cleverness.
- Avoid oversized components and monolithic modules.
- Reuse existing abstractions when they are sound.
- Introduce abstractions when they provide meaningful value.
- Avoid speculative features and overengineering.

### 7.2 Type & Validation Safety

- Use existing TypeScript conventions.
- Avoid unnecessary `any`.
- Validate external, client-supplied, and AI-generated data.
- Handle null, undefined, empty, and malformed states appropriately.
- Do not rely on type declarations alone to validate runtime data.

### 7.3 Error Handling

- Do not silently swallow failures.
- Return useful, safe error information.
- Avoid exposing internal implementation details to users.
- Preserve user content during failure handling.
- Distinguish recoverable failures from unrecoverable ones.

### 7.4 UI Behavior

- Maintain consistent loading, empty, success, and error states.
- Prevent unintended duplicate submissions.
- Avoid stale state and lifecycle errors.
- Keep interactive controls accessible.
- Verify mobile and desktop behavior for affected workflows.

---

## 8. Security & Data Safety

Security is a requirement throughout development, not a separate final phase.

- Authenticate protected operations.
- Authorize every resource operation server-side.
- Never trust client-provided ownership or access claims.
- Validate input before processing.
- Protect secrets and private data.
- Handle AI output as untrusted.
- Avoid unsafe rendering.
- Prevent unintended data overwrites or deletions.
- Review security implications of dependency changes.

### Sensitive Operations

Explicit owner approval is required before performing actions such as:

- Destructive data operations.
- Production database changes.
- Breaking data migrations.
- Removing existing functionality.
- Changing authentication or authorization architecture.
- Production deployment.
- Actions with substantial external cost.
- Expanding project scope materially.

When uncertain, stop and ask.

---

## 9. Dependencies & Configuration Changes

Before introducing or upgrading a dependency:

1. Establish the technical need.
2. Check compatibility with the current stack.
3. Evaluate maintenance and security.
4. Consider bundle size and resource impact.
5. Check licensing where relevant.
6. Determine whether an existing dependency can solve the problem.
7. Explain meaningful trade-offs.

Avoid broad upgrades during unrelated recovery work.

Keep package changes and lockfile updates consistent. Use `npm ci` to verify clean dependency installation when appropriate.

Configuration changes must be documented and must not introduce secrets or environment-specific assumptions.

---

## 10. CI & Verification Workflow

Automated checks should be used consistently as CI becomes available or is repaired.

Expected checks include:

- Clean dependency installation.
- Lint.
- Tests.
- Production build.
- Relevant security or regression checks.

### Local Verification

Run focused checks while implementing and the relevant complete verification suite before finalizing.

### CI Verification

Confirm that required checks actually ran and passed.

Do not:

- Claim CI passed without inspecting its result.
- Bypass failing checks without documenting why.
- Disable tests to make a pipeline green.
- Hide build failures.
- Treat a local build as proof of production deployment health.

---

## 11. Documentation Practices

Documentation should remain useful, accurate, and lean.

Update documentation when changes affect:

- Setup.
- Environment variables.
- Commands.
- Architecture.
- Data behavior.
- APIs.
- User-facing workflows.
- Recovery status.
- Known limitations.

Avoid duplicating existing approved documents.

Project decisions should be documented in the relevant technical or project document. Separate decision records should only be introduced when a decision is sufficiently significant to warrant one.

---

## 12. Agent Operating Rules

AI agents working in SyncSphere are expected to behave as accountable engineering contributors.

### Agents Must

- Read root `AGENTS.md` before repository work.
- Follow approved project documentation.
- Verify the branch before changes.
- Inspect before implementation.
- Work within the approved scope.
- Use tests and report their results.
- Preserve user changes and existing features.
- Avoid unnecessary dependencies.
- Report uncertainty honestly.
- Provide evidence for verification claims.
- Stop when owner approval is required.

### Agents Must Not

- Rewrite the project without justification.
- Invent repository contents or test results.
- Commit incomplete work as completed.
- Hide failing checks.
- Remove features without approval.
- Expose or commit secrets.
- Perform destructive operations without authorization.
- Deploy or merge into production without approval.
- Expand scope without approval.

### Execution Authority

Agents may execute routine, scoped, reversible engineering tasks within approved project boundaries.

Owner approval remains necessary for material architectural changes, destructive operations, production actions, scope expansion, or significant security/data risks.

---

## 13. Completion Report Template

Every completed engineering task should end with a report using the following structure:

### Task
Brief description of the objective.

### Changes
- Summary of implementation.
- Important files changed.
- Relevant design decisions.

### Verification

| Check | Result |
|---|---|
| Targeted tests | Passed / Failed / Blocked / Not run |
| Regression tests | Passed / Failed / Blocked / Not run |
| Lint | Passed / Failed / Blocked / Not run |
| Build | Passed / Failed / Blocked / Not run |
| Runtime verification | Passed / Failed / Blocked / Not run |
| CI | Passed / Failed / Blocked / Not run |

Only applicable checks need to be included, but omitted checks must not be implied as passing.

### Risks & Limitations
Known issues, blockers, unverified areas, or follow-up tasks.

### Git
- Branch.
- Commit SHA, if committed.
- Working tree status, if verified.

### Status
Completed / Partially completed / Blocked.

---

## 14. Definition of Done

A task is considered complete when:

- Acceptance criteria are satisfied.
- Changes remain within scope.
- Tests are added or updated as appropriate.
- Relevant verification is performed.
- Regression risks are reviewed.
- No known failures are concealed.
- Documentation is updated where necessary.
- The diff is reviewed.
- Completion status is reported honestly.

A task may be reported as partially completed or blocked when some requirements cannot be verified.

---

## 15. Guide Maintenance

This guide may be updated as the recovery process reveals practical workflow needs.

Workflow improvements should remain proportional to project complexity and should not create unnecessary process overhead.

Material changes to project governance or agent authority must remain consistent with the approved Project Charter and `AGENTS.md`.

---

**End of Development Guide — Version 0.1 — Approved**
