# SyncSphere

SyncSphere is a collaborative workspace for organizing workspaces and documents, editing rich-text content, and using Gemini-powered AI to generate document templates.

> **Project status: Recovery and stabilization in progress.** SyncSphere is an early-stage application being brought back under active development. Features described below are based on the existing repository; build, security, and production readiness are still being verified.

## Features

- **Workspace organization** — create and organize workspaces.
- **Document management** — create, rename, and delete workspace documents.
- **Rich-text editor** — edit content with Editor.js and supported blocks, including headings, lists, checklists, tables, quotes, code, and other configured tools.
- **Workspace customization** — customize workspaces with emoji and cover images.
- **Authentication** — sign-in and sign-up flows powered by Clerk.
- **Cloud data** — Firebase / Firestore integration for workspace and document data.
- **AI template generation** — Gemini-powered template generation from the editor workflow.
- **Workspace navigation** — navigate workspace documents and switch workspace context.

Some collaboration behavior and backend security controls have not yet been fully verified. Real-time data subscriptions should not be treated as conflict-safe, fully synchronized collaborative editing.

## Technology Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| UI | React 18 |
| Authentication | Clerk |
| Database / data synchronization | Firebase Firestore |
| Rich-text editor | Editor.js |
| AI | Google Gemini API |
| Styling | Tailwind CSS, Radix UI |

## Getting Started

### Prerequisites

- Node.js 20.x (recommended for the recovery CI environment)
- npm
- Access to the required Clerk, Firebase, and Gemini configuration for features that depend on them

### 1. Clone the repository

```bash
git clone https://github.com/EvansAbraham/SyncSphere.git
cd SyncSphere
```

### 2. Check out the recovery branch

Development and recovery work currently happens on `agentic-development`, not `main`.

```bash
git checkout agentic-development
```

### 3. Install dependencies

Use the committed lockfile for a reproducible dependency installation:

```bash
npm ci
```

### 4. Configure environment variables

Copy the provided sample file to your local environment file:

```bash
cp .env.sample .env
```

Fill in the required values for the services you configure. **Never commit your real `.env` file or credentials.**

Environment variables currently documented by the sample:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `CLERK_SECRET_KEY` | Clerk server secret |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in route configuration |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up route configuration |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase client API key |
| `NEXT_FIREBASE_AUTH_DOMAIN` | Firebase auth-domain setting |
| `NEXT_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket setting |
| `NEXT_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID |
| `NEXT_PUBLIC_MAX_FILE_COUNT` | File count setting used by the app |
| `NEXT_GEMINI_API_KEY` | Gemini credential placeholder (AI configuration is under review) |

> **Configuration caveat:** Environment variable usage in the application has known inconsistencies with the sample file. Configuration will be reconciled during the recovery work. Do not assume every integration works with these values until the setup has been verified.

> **Security note:** The current AI implementation requires a security review before it should be used with a production API credential. Keep keys private and do not expose secrets through client-side variables, screenshots, commits, or issue reports. The AI integration is planned to be moved behind a server-side boundary as part of recovery.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Next.js development server |
| `npm run build` | Build the production application |
| `npm run start` | Run the production server after a successful build |
| `npm run lint` | Run Next.js linting (configuration is being established) |

## CI and Development Workflow

GitHub Actions CI is configured in `.github/workflows/ci.yml` and currently targets the recovery branch:

- Installs dependencies using `npm ci`
- Runs lint if an ESLint configuration is present
- Runs tests if a test script is present
- Builds the application

Lint and test steps may currently be skipped with warnings because the test framework and lint configuration have not yet been established. A passing production build alone is **not** a full quality or security guarantee. CI will be strengthened as the project recovery progresses.

### Branch and pull-request flow

1. Work on `agentic-development` or a short-lived feature branch based on it.
2. Commit small, focused changes with clear messages.
3. Push changes and review the CI results.
4. Open a pull request into `main` only after the changes are ready for review.
5. Merge only after review and the required checks are satisfied.

Production deployment is managed separately through the repository's Vercel integration. Confirm the Vercel production branch and preview behavior in project settings before relying on this flow.

## Current Limitations and Recovery Priorities

SyncSphere is being stabilized. Areas that need verification or improvement include:

- Firestore security rules and workspace/document authorization.
- Server-side handling and security of Gemini requests and API keys.
- Environment-variable consistency and configuration validation.
- Editor lifecycle, save behavior, listener cleanup, and concurrent-edit safety.
- Reliable workspace/document creation and deletion, including failure handling.
- Automated tests, lint configuration, CI enforcement, accessibility, and responsive behavior.

This list reflects recovery work in progress; some items are findings from static inspection and still require reproduction or runtime validation.

## Contributing

Contributions and bug reports are welcome. During recovery, please keep changes focused and avoid large rewrites or dependency migrations without discussion.

1. Fork the repository or create a branch from the recovery branch.
2. Make a focused change.
3. Run the checks that are available locally.
4. Commit with a descriptive message.
5. Open a pull request targeting `agentic-development` and include the context, testing performed, and any remaining limitations.

Please report issues through the [GitHub Issues](https://github.com/EvansAbraham/SyncSphere/issues) page. Do not include API keys, tokens, passwords, or other private configuration in issues.

## License

No license file is currently present in the repository. Until a license is added, the project should not be assumed to grant open-source reuse permissions.
