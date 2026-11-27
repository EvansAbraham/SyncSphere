# SyncSphere — Project Charter

**Document Status:** Approved  
**Approved By:** Evans Abraham  
**Version:** 0.3  
**Project Status:** Recovery, Stabilization & Modernization  
**Repository:** EvansAbraham/SyncSphere  
**Development Branch:** `agentic-development`  
**Production Branch:** `main`

## 1. Project Identity

SyncSphere is a collaborative workspace and document-management application for organizing workspaces, creating/managing documents, authoring structured content, and using AI-assisted productivity features. It is an existing product undergoing recovery, stabilization, modernization, and focused development—not a greenfield rewrite.

## 2. Mission

Build a dependable, intuitive, accessible workspace where users organize work, create and manage documents, express ideas through flexible formatting, and use intelligent assistance without compromising reliability, security, or control over their data.

## 3. Vision

Evolve SyncSphere into a cohesive productivity experience combining workspace organization, document creation, rich content editing, and intelligent assistance across devices. Expansion is guided by user needs, feasibility, and reliability—not feature accumulation.

## 4. Product Principles

1. **Reliability before expansion:** stabilize existing features before adding complexity.
2. **User data is sacred:** persistence, recovery, and protection against loss take precedence.
3. **Security is foundational:** auth, access control, isolation, and secret management are essential.
4. **AI is assistive:** output stays user-controlled and cannot silently replace work.
5. **Simplicity:** avoid unnecessary dependencies, abstractions, and architecture.
6. **Evidence-driven engineering:** decisions rely on inspection, tests, measured behavior, or documented reasoning.
7. **Incremental development:** scoped, reviewable, reversible changes.
8. **Accessibility and usability:** responsive, clear, accessible interactions are requirements.
9. **Product identity:** modernization should strengthen SyncSphere, not turn it into another product.

## 5. Target Users

- Individuals organizing projects, notes, and documents.
- Users maintaining separate workspaces for different contexts.
- Document authors creating and formatting content.
- Users needing PDF export/shareable output.
- Users benefiting from AI-assisted drafts/templates.
- Individuals and teams as collaborative capability evolves.

Target audiences may be refined through feedback.

## 6. Existing Capabilities (Static Audit; Verification Pending)

- Authentication.
- Workspace creation/management and cover/emoji customization.
- Document creation, renaming, deletion, and navigation.
- Editor.js rich-text editing.
- Firestore persistence/subscriptions.
- Gemini-assisted document/template generation.

Static presence is not a claim of reliability, security, or production readiness.

## 7. Recovery Scope

### 7.1 Recovery and stability
Establish reproducible setup; validate runtime/dependency baseline; resolve critical defects; improve persistence, race conditions, lifecycle, errors, testing, and CI; verify features before modifying.

### 7.2 Security and data protection
Audit auth/authorization, ownership/membership, Firestore rules, secrets, server-side AI, input/output validation, abuse prevention, and safe mutations.

### 7.3 Approved platform modernization
Modernize deliberately toward **Node.js 24 LTS, Next.js 16, and React 19**, subject to compatibility and staged migration. Keep JavaScript ES6+/JSX/MJS. npm remains canonical. Existing Clerk, Firebase/Firestore, Gemini, Editor.js, Tailwind, and Radix are assessed and updated only as needed and compatible. This is controlled modernization, not blanket dependency upgrades.

TypeScript migration is **P3/deferred**, excluded from recovery acceptance.

### 7.4 Responsive design and accessibility
Support mobile/tablet/desktop; adaptive navigation and editing; touch-friendly controls; dialogs/popovers; accessible keyboard/focus/labels/contrast; robust wide-content behavior.

### 7.5 Document editing
Stabilize editor lifecycle, load/edit/save/reopen, visible save state, content preservation, and agreed formatting blocks. Final scope is validated through requirements and compatibility assessment.

### 7.6 PDF export
Provide readable, printable, downloadable PDFs from structured document content. Preserve supported formatting, selectable text where feasible, pagination, margins, tables, images, and code; avoid viewport screenshots and clipping. Library and preview are subject to evaluation.

### 7.7 AI assistance
Keep AI server-side, authenticated, validated, abuse-controlled, and user-reviewed. Generated content must not silently overwrite existing documents.

### 7.8 Engineering quality
Introduce maintainable JS conventions, appropriate tests, lint, build verification, CI gates, and current documentation. Report actual evidence.

## 8. Modernization Strategy

Confirm the actual baseline before migration. Upgrade runtime, framework, React, and related packages in stages with compatibility checks, focused tests, build and critical workflow verification, rollback checkpoints, and clean commits. P0 security work must not be delayed. Avoid unnecessary rewrites, dependencies, or infrastructure.

## 9. Out of Scope for Immediate Recovery

Unless separately approved:
- Conflict-free collaboration / CRDT / operational transformation.
- Presence, live cursors, advanced collaboration.
- Advanced document history/versioning.
- Autonomous/background AI agents.
- Additional export formats beyond agreed PDF.
- Enterprise administration.
- Microservices or wholesale architecture replacement.
- TypeScript port.

## 10. Project Governance

The Project Owner retains final authority over scope, architecture, acceptance, and release. Approved documents are the source of truth; material changes require review. Agents may execute routine scoped, reversible work but must stop for destructive actions, breaking migrations, production operations, significant security/data risks, new costs, or scope changes.

## 11. Branch and Release Policy

`agentic-development` is the recovery branch; `main` is production-bound. Do not merge to main, deploy production, change production settings, or perform destructive data operations without explicit owner authorization. Work must be reviewed, tested, and documented.

## 12. Success Criteria

Recovery is successful when core features and data integrity are reliable; auth/access boundaries verified; AI secured; editor and persistence dependable; responsive UX/accessibility verified; PDF export meets scope; target platform modernization completed with compatibility evidence; automated tests, CI, and build are trustworthy; documentation and limitations current; and the Project Owner accepts recovery.

---

**End of Project Charter — Version 0.3 — Approved**
