# AI Contribution Contract

This file is the standing contract for every AI tool touching this
repository — today's and whatever replaces them. It exists because an AI
absorbs no culture between sessions: every conversation starts from zero,
and each individually reasonable suggestion (a helper library here, a folder
rename there) compounds into exactly the entropy this architecture exists to
prevent. Full reasoning: `frontend-learning-platform-architecture.md` §19.

## Never, without explicit human approval

- Introduce a new dependency.
- Modify routing or URL structure (see [ADR-002](docs/architecture/ADR-002-routing.md)).
- Change the content schema or lesson contract (see [ADR-001](docs/architecture/ADR-001-content-contract.md)).
- Move or rename folders.
- Introduce any backend technology (databases, auth, APIs, services).
- Change an architectural invariant recorded in the architecture document or
  an ADR.

These are escalation triggers, not blanket prohibitions: propose the change
and wait for a conscious human decision (often a new ADR), rather than
drifting into it silently.

## Always

- Prefer existing components over creating new ones.
- Preserve the lesson contract and the MDX component whitelist (currently
  `Callout`, `Diagram`, `Figure`, `Playground` — the closed set in
  `src/components/mdx/index.ts`, enforced at build time by
  `src/lib/mdx.ts`).
- Keep the build passing — a change that breaks `pnpm build`,
  `pnpm lint`, or `pnpm typecheck` is not done.
- Create lessons as `status: draft`; promote at most to `review`. Only a
  human-authored commit promotes a lesson to `published`.
- Update `.ai/prompts/` in the same commit as any change to the schema
  (`src/lib/schema.ts`) or the MDX component whitelist — the prompt library
  is a second copy of that contract in prose form, and it must never drift
  from the code it describes.

## Where things live

- **Architecture:** `frontend-learning-platform-architecture.md` — the
  founding document; read it before proposing anything structural.
- **Roadmap:** `implementation-roadmap.md` — one milestone per session, in
  order, stop after each for human review. See its own execution rules.
- **Decisions:** `docs/architecture/ADR-*.md` — immutable once accepted;
  supersede, never edit.
- **Progress log:** `progress.md` — append an entry after completing any
  task; don't rewrite history.
- **Prompt library:** `.ai/prompts/` — one file per recurring AI task
  (`lesson.md`, `implementation.md`, `review.md`, `quiz.md`, `diagram.md`).
  `implementation.md` references this file rather than duplicating it.

## Who does what

- **ChatGPT** drafts lesson prose from `.ai/prompts/lesson.md`, operating on
  text only — it never needs to know the app exists.
- **Claude Code** implements `/src` changes and places MDX files, bound by
  this contract and `.ai/prompts/implementation.md`.
- **The human** reviews rendered previews, promotes `review → published`,
  and merges. Editor-in-chief, not typist.
