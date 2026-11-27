# AGENTS.md

**Project:** SyncSphere  
**Document Status:** Approved  
**Version:** 0.1  
**Document Type:** Repository Agent Instructions  
**Location:** Repository Root  
**Approved By:** Evans Abraham (Project Owner)

---

## 1. Project Context

SyncSphere is an existing collaborative workspace and document application undergoing recovery, stabilization, security improvement, and modernization.

This is **not a greenfield project and not an invitation to rewrite the application from scratch**.

Preserve existing functionality unless removal, replacement, or modification is explicitly approved.

## 2. Tech Stack & Canonical Commands

### Stack

- Next.js 14 (App Router)
- React 18
- Clerk Authentication
- Firebase / Firestore
- Editor.js
- Google Gemini API
- Tailwind CSS
- Vercel

### Package Manager

- Use `npm` exclusively.
- Use `npm ci` for clean, lockfile-based dependency installations.
- Never switch to `yarn` or `pnpm`.
- Do not modify or regenerate the lockfile unnecessarily.

### Canonical Commands

| Purpose | Command |
|---|---|
| Install dependencies | `npm ci` |
| Development server | `npm run dev` |
| Lint | `npm run lint` |
| Tests | `npm test -- --run` |
| Production build | `npm run build` |

- Skip linting only if an ESLint configuration has not yet been established.
- Skip testing only if a `test` script has not yet been defined.
- If a required command fails, investigate and report the actual failure. Do not silently skip, bypass, or misrepresent it.
- Do not change the project's established tooling to accommodate an agent's preference.

## 3. Non-Negotiable Architecture & Security Invariants

### Server-Side AI Only

- All Google Gemini API calls must execute strictly on the server through API routes, Server Actions, or other approved server-side modules.
- Gemini API keys and credentials must never be exposed in client-side code, client bundles, browser requests, or `NEXT_PUBLIC_*` environment variables.
- AI requests must be subject to authentication, input validation, appropriate abuse protection, and error handling.
- Do not move AI execution to the client to simplify implementation.

### Authentication & Ownership Enforcement

- Clerk manages user identity and authentication.
- Every protected Firestore operation and server endpoint must enforce authentication and authorization.
- Verify workspace membership, ownership, and document access on the trusted server side as appropriate.
- Never trust client-supplied user IDs, workspace IDs, ownership claims, or permissions without server-side verification.
- Authentication alone does not establish authorization to access a particular resource.

### Environment Hygiene

- Never commit `.env` files, secrets, API keys, credentials, tokens, or private configuration.
- `.env.example` is the canonical place to document required environment variable names using safe placeholders.
- Never place real credentials in example files, logs, test fixtures, documentation, or commits.
- Do not invent environment variable names or silently change existing configuration contracts.
- Investigate discrepancies between application code, existing environment configuration, and `.env.example` before making configuration changes.

### Modular Boundaries

- Keep route handlers thin.
- Isolate business logic, data access, validation, and AI orchestration into appropriate modules.
- Avoid monolithic files and unnecessary coupling.
- Reuse established patterns where they are sound.
- Introduce new abstractions only when they provide meaningful separation, maintainability, or testability.
- Do not restructure unrelated code merely to satisfy stylistic preferences.

## 4. Source of Truth

Before undertaking work, consult the relevant approved project documents:

- `docs/PROJECT_CHARTER.md` — project mission, boundaries, principles, and governance.
- `docs/PRODUCT_REQUIREMENTS.md` — product scope, functionality, and acceptance requirements.
- `docs/RECOVERY_ROADMAP.md` — approved sequencing and milestone scope, once available.
- `docs/TECHNICAL_PLAN.md` — architecture and technical decisions, once available.
- `docs/DEVELOPMENT_GUIDE.md` — engineering and verification workflow, once available.

Do not invent requirements or silently treat suggestions as approved decisions.

If documents conflict, identify the conflict. Do not silently override approved requirements or expand scope.

## 5. Branch Safety

- `main` is production-bound and must remain untouched during recovery development.
- Use `agentic-development` as the primary development branch.
- Use feature branches when appropriate for isolated work.
- Never commit implementation work directly to `main`.
- Verify the active branch before modifying files or committing.
- Do not merge, deploy, or alter production-bound branches without explicit authorization.

## 6. Mandatory Repository Inspection

Before making changes:

1. Inspect the relevant files and surrounding implementation.
2. Understand existing behavior, dependencies, callers, and data flow.
3. Check for existing tests and conventions.
4. Identify the potential impact on related features.
5. Establish a baseline before modifying behavior when practical.

Do not perform blind edits, speculative rewrites, or broad refactors unrelated to the assigned task.

## 7. Scope Discipline

- Work only within the approved task scope.
- Preserve unrelated functionality and user changes.
- Do not remove features merely because they are outdated, inconvenient, or architecturally undesirable.
- Avoid unnecessary dependencies and framework replacements.
- Avoid scope expansion disguised as cleanup.
- Prefer small, reviewable, reversible changes.

If the task requires significant scope changes, feature removal, a major architectural decision, or a breaking change, stop and request owner approval.

## 8. Engineering Practices

- Prefer Test-Driven Development when applicable: **RED → GREEN → REFACTOR**.
- Write or update tests to cover changed behavior and relevant regressions.
- Follow established repository conventions unless a justified change is approved.
- Prioritize correctness, security, maintainability, and data integrity over shortcuts.
- Do not suppress errors merely to make tests or builds pass.
- Do not introduce unnecessary abstractions or complexity.
- Keep changes focused and reviewable.

## 9. Security & Data Protection

- Never expose secrets, credentials, tokens, private keys, or sensitive configuration.
- Never commit `.env` files, credentials, or real user data.
- Do not weaken authentication, authorization, validation, or security rules to bypass a problem.
- Treat client input, external API responses, AI output, and stored content as untrusted.
- Protect workspace and document ownership boundaries.
- Do not execute destructive data operations or irreversible migrations without explicit approval.
- Report security vulnerabilities immediately when discovered, even if outside the assigned task.

## 10. Dependency & Configuration Changes

Before adding, removing, or upgrading dependencies:

- Establish why the change is necessary.
- Review compatibility, maintenance, security, and resource implications.
- Avoid dependency changes unrelated to the task.
- Never silently replace core libraries or infrastructure.
- Document meaningful configuration or environment variable changes.
- Never guess missing secrets or credentials.

Seek approval before substantial dependency replacement, infrastructure changes, or costly external services.

## 11. Verification Requirements

Verify changes using the most relevant available checks, such as:

- Unit and integration tests
- Linting and static analysis
- Type checking
- Production builds
- Targeted manual testing
- Security checks

Report verification accurately:

- **Passed:** executed and passed.
- **Failed:** executed and failed.
- **Blocked:** could not execute due to an identified limitation.
- **Not run:** not attempted.

Never fabricate test results, build status, runtime behavior, browser validation, security verification, or deployment success.

A successful build alone does not prove the feature works correctly.

## 12. Git & Commit Discipline

- Make focused, meaningful commits.
- Use clear commit messages.
- Inspect the diff before committing.
- Do not include unrelated files or changes.
- Never commit secrets, generated clutter, or debugging artifacts.
- Do not rewrite shared history, force-push, or amend existing commits without explicit authorization.
- Do not commit or push unless the task authorizes it.

## 13. Owner Approval Required

Stop and request approval before:

- Removing or materially changing existing features.
- Making major architectural or technology-stack changes.
- Performing breaking changes or schema migrations.
- Executing destructive, irreversible, or high-risk operations.
- Modifying production data, production configuration, or deployment settings.
- Introducing paid services or costs.
- Changing approved project scope or acceptance criteria.
- Making decisions involving significant security, privacy, or data-loss risks.
- Proceeding when an unresolved ambiguity could materially affect the outcome.

Do not assume approval from silence.

## 14. Completion Report

At the end of each task, provide a concise report covering:

1. **Summary:** What changed and why.
2. **Files:** Which files were created, modified, or deleted.
3. **Verification:** Checks executed and their actual results.
4. **Limitations:** What remains unverified or blocked.
5. **Git:** Branch and commit details, if applicable.
6. **Follow-up:** Outstanding issues or owner decisions required.

Do not report a task as fully complete when important verification remains outstanding.

## 15. Operating Principle

Act as a careful engineering agent, not an autonomous project owner.

Inspect before acting.  
Follow approved scope.  
Protect existing behavior and data.  
Verify before claiming success.  
Ask before crossing approval boundaries.

**The Project Owner retains final authority over project scope, architectural direction, and high-impact decisions.**
