# SyncSphere

SyncSphere is a collaborative workspace for organizing workspaces and documents, editing rich-text content, and using Gemini-powered AI to generate document templates.

> **Project status: Recovery and modernization in progress.** SyncSphere is an existing product being recovered and incrementally modernized. Repository features and behavior are still being verified; this is not a greenfield rewrite.

## Recovery goals

- Secure authentication, authorization, and data access.
- Preserve existing product features and user data.
- Stabilize workspace/document workflows, editor lifecycle, and persistence.
- Modernize the runtime and framework deliberately, using compatibility checks and incremental changes.
- Establish reliable tests, linting, CI gates, and maintainable developer workflows.
- Improve responsive/mobile usability, editing, and PDF export without unnecessary redesign.

## Existing features (verification in progress)

- Workspace organization and customization (emoji and cover images).
- Document creation, renaming, deletion, and navigation.
- Rich-text editing using Editor.js and configured blocks.
- Clerk authentication.
- Firebase / Firestore workspace and document data.
- Gemini-powered document/template generation.

Real-time subscriptions should not be assumed to provide conflict-safe collaborative editing. Security, runtime behavior, and production readiness are being verified.

## Technology direction

| Area | Current repository baseline | Recovery target |
| --- | --- | --- |
| Runtime | Node.js 20 CI | Node.js 24 LTS |
| Framework | Next.js 14 (App Router) | Next.js 16 |
| UI | React 18 | React 19 |
| Language | JavaScript / JSX / MJS | JavaScript (ES6+) / JSX retained |
| Package manager | npm | npm |
| Authentication | Clerk | Clerk (compatibility review and update as needed) |
| Data | Firebase / Firestore | Firebase / Firestore (security and integrity review) |
| Editor | Editor.js | Editor.js ecosystem assessment and maintenance plan |
| AI | Google Gemini SDK | Gemini SDK/server-side integration with security review |
| Styling | Tailwind CSS 3, Radix UI | Modern supported compatible versions after evaluation |
| Hosting | Vercel | Vercel (deployment configuration reviewed) |

Target versions describe the intended direction, not the versions currently installed. Upgrades will be staged, compatibility-tested, and documented. No blanket dependency upgrades.

### Language strategy

JavaScript remains the project language during recovery. Existing `.js`, `.jsx`, and `.mjs` files are expected and preferred. A TypeScript migration is **deferred (P3)** and is not a recovery requirement.

## Getting started

### Prerequisites

- Node.js 24 LTS is the modernization target; use the currently checked-in dependency/runtime baseline until migration is completed and documented.
- npm.
- Clerk, Firebase, and Gemini configuration for the features you intend to run.

### 1. Clone the repository

```bash
git clone https://github.com/EvansAbraham/SyncSphere.git
cd SyncSphere
git checkout agentic-development
```

### 2. Install dependencies

Use the committed lockfile for reproducible installs:

```bash
npm ci
```

### 3. Configure environment

Copy the sample file:

```bash
cp .env.sample .env
```

Fill in required values for the services you configure. **Never commit your real `.env` or credentials.** Environment variable usage currently has inconsistencies that will be reconciled during recovery. Do not assume every integration works until setup has been verified.

AI configuration is under security review. Keep credentials private; Gemini calls must be secured behind an approved server-side boundary before production use.

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the production application |
| `npm run start` | Run the production server after building |
| `npm run lint` | Linting script (configuration is being established) |

## CI and workflow

The existing GitHub Actions workflow currently uses Node.js 20 and conditionally runs lint/tests depending on whether their configuration/scripts exist; it builds the app. CI is a known modernization task.

**CI target:** Node.js 24, reproducible `npm ci`, enforced linting and tests once established, production build, and relevant security/regression checks. PR validation will be aligned to the recovery branch. CI improvements will be implemented separately from this documentation change.

## Branch safety

- Recovery work belongs on `agentic-development` (or focused branches based on it).
- `main` is production-bound and must remain untouched during recovery.
- Keep commits focused and review CI results.
- Do not merge to `main`, deploy production, or perform destructive data migrations without explicit project-owner approval.

## Recovery priorities

1. **P0 — Security and data integrity:** authentication/authorization, Firestore access rules, credential handling, safe mutations, content preservation.
2. **P1 — Modernization and core stability:** Node 24 / Next.js 16 / React 19 compatibility, dependency alignment, reliable CRUD and persistence, editor/listener lifecycle, CI foundations.
3. **P2 — Product quality:** mobile responsiveness, editor UX, accessibility, PDF export, and regression coverage.
4. **P3 — Deferred:** TypeScript migration and other nonessential enhancements.

Modernization will be incremental. Critical security fixes must not be delayed by stack upgrades; dependency migrations must be staged to minimize regressions.

## Documentation

- [Project Charter](docs/PROJECT_CHARTER.md)
- [Product Requirements](docs/PRODUCT_REQUIREMENTS.md)
- [Recovery Roadmap](docs/RECOVERY_ROADMAP.md)
- [Technical Plan](docs/TECHNICAL_PLAN.md)
- [Development Guide](docs/DEVELOPMENT_GUIDE.md)
- [Agent Instructions](AGENTS.md)

## Contributing

During recovery, please keep changes focused and avoid large rewrites or dependency migrations without discussion. Run available checks and report accurately what was and was not verified. Pull requests should target `agentic-development` and include context, checks run, and known limitations. Never include credentials or private configuration in issues or commits.

## License

No license file is currently present. Until one is added, the project should not be assumed to grant open-source reuse permissions.
