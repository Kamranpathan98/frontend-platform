# Progress Log

Tracks completed implementation work against
[implementation-roadmap.md](./implementation-roadmap.md) (16 milestones,
source of truth: [frontend-learning-platform-architecture.md](./frontend-learning-platform-architecture.md)).
One entry per completed task — append, don't rewrite history.

---

## Milestone status

- [x] M1 — Repository Bootstrap & Toolchain
- [x] M2 — Deployment Pipeline
- [x] M3 — Development Tooling & Build Gates
- [x] M4 — Design System Foundation
- [x] M5 — Application Shell (Layout Chrome)
- [x] M6 — Content Contract & Gateway
- [x] M7A — MDX Rendering Pipeline & Component Whitelist (core)
- [x] M7B — Diagrams (Mermaid) rendered to static SVG at build time
- [x] M8 — Lesson & Category Routing (+ Tags)
- [x] M9 — Navigation & Sidebar
- [x] M10 — Search (Pagefind)
- [x] M11 — Sandpack Playgrounds (+ later polish: loading feedback, theme sync)
- [x] M12 — SEO & Structured Data
- [x] M13 — Lesson Scaffold Script
- [x] M14 — Project Governance (ADRs + CLAUDE.md + prompt library)
- [x] M15 — Developer Experience & Maintenance Jobs
- [ ] **M16 — Launch Content: First 3 Published Lessons** ← next (1 of 3 done — `javascript/closures`)

---

## 2026-07-29

- Added `suppressHydrationWarning` to `<body>` in [layout.tsx](./src/app/layout.tsx) to silence
  a false-positive hydration mismatch caused by the Grammarly browser extension injecting
  `data-new-gr-c-s-check-loaded` / `data-gr-ext-installed` attributes.
- Created this progress log and cross-checked repo state against `implementation-roadmap.md`:
  confirmed M1–M12 complete (M7 split into M7A/M7B per the roadmap's pre-approved split rule),
  M13–M16 not yet started.

---

## M13 — Lesson Scaffold Script (2026-07-29)

**Completed Work:** `pnpm new-lesson <category> <slug>` scaffolds
`content/lessons/<category>/<slug>/index.mdx` + `assets/.gitkeep`, with
schema-valid frontmatter (`schemaVersion: 1`, `status: draft`, auto-computed
`order`, title-cased from the slug) and the full §6 section-heading template.

**Files Created:** [scripts/new-lesson.ts](./scripts/new-lesson.ts)

**Files Modified:**
- [package.json](./package.json) — added the `new-lesson` script.
- [tsconfig.json](./tsconfig.json) — added `allowImportingTsExtensions: true`,
  required because the script imports `../src/lib/schema.ts` with an explicit
  `.ts` extension (needed for Node's native `--experimental-strip-types`
  runner, since no ts-node/tsx dependency was added per the milestone's
  "prefer no new deps" rule). `noEmit` was already `true`, so this doesn't
  loosen strictness.

**Architecture Rules Followed:**
- Imports `lessonFrontmatterSchema` from `lib/schema.ts` rather than
  redefining the field list (review checklist item).
- Does **not** import `lib/content.ts` — that module uses extension-less
  relative imports (fine for Next's bundler, unresolvable by Node's own ESM
  loader). Matches the existing precedent of `copy-lesson-assets.mjs` /
  `render-diagrams.mjs`, which also read `content/` directly as
  authoring-time tools rather than through the app's content gateway.
- Generated lesson always defaults to `status: draft`.
- Fails closed: validates the frontmatter object against the real Zod schema
  before writing, then re-reads the written file and re-validates
  (round-trip) before declaring success — rolls back (deletes the folder) on
  any failure so nothing invalid is ever left on disk.

**Manual Testing Performed:** ran the script for a new lesson in an existing
category (order auto-incremented correctly after fixing an off-by-one where
order was computed after the folder already existed) and a brand-new
category (order reset to 1); verified missing-args, invalid-slug-format, and
duplicate-lesson error paths; ran a full `pnpm build` with a generated draft
lesson present and confirmed it builds successfully and is excluded from
static output. Test lessons were deleted after verification.

**Validation Results:**
- `pnpm build` — pass
- `pnpm lint` — pass
- `pnpm typecheck` — pass

**Known Limitations:** `order` is a simple sibling-folder count, not a
content-aware max+1 (kept intentionally simple, per architecture-doc
principle #5 — the human reviews/adjusts `order` while filling in the draft
anyway, and the sidebar already has a deterministic slug tiebreaker for
collisions).

**Next Milestone:** M14 — Project Governance.

---

## M14 — Project Governance (2026-07-29)

**Completed Work:** The three founding ADRs, `CLAUDE.md` (the AI
Contribution Contract from architecture-doc §19), and the five-file prompt
library in `.ai/prompts/`.

**Files Created:**
- [docs/architecture/ADR-001-content-contract.md](./docs/architecture/ADR-001-content-contract.md)
- [docs/architecture/ADR-002-routing.md](./docs/architecture/ADR-002-routing.md)
- [docs/architecture/ADR-003-search.md](./docs/architecture/ADR-003-search.md)
- [CLAUDE.md](./CLAUDE.md)
- [.ai/prompts/lesson.md](./.ai/prompts/lesson.md)
- [.ai/prompts/implementation.md](./.ai/prompts/implementation.md)
- [.ai/prompts/review.md](./.ai/prompts/review.md)
- [.ai/prompts/quiz.md](./.ai/prompts/quiz.md)
- [.ai/prompts/diagram.md](./.ai/prompts/diagram.md)

**Files Modified:** None (removed the now-redundant `.gitkeep` placeholders
in `docs/architecture/` and `.ai/prompts/` now that each holds real files).

**Architecture Rules Followed:**
- Each ADR follows the Context / Decision / Alternatives / Consequences
  format, stays roughly half a page, and is headed "Accepted — immutable."
- `CLAUDE.md`'s "never without approval" / "always" rules are verbatim from
  §19, plus pointers to where things live (roadmap, ADRs, progress log,
  prompt library) so a cold session can orient itself in one read.
- `lesson.md` embeds the real component whitelist (`Callout`, `Diagram`,
  `Figure`, `Playground` — read directly from
  `src/components/mdx/{index,callout,figure,diagram,playground}.tsx`, props
  and all) and the real section template from `scripts/new-lesson.ts` (M13),
  not a placeholder list.
- `implementation.md` references `CLAUDE.md` rather than duplicating its
  rules.
- `quiz.md` and `diagram.md` both exist; `quiz.md` is explicitly marked
  not-yet-usable (`<Quiz>` doesn't exist in the whitelist yet — Phase 2),
  while `diagram.md` documents the real, already-shipped Mermaid pipeline
  (`scripts/render-diagrams.mjs`).

**Manual Testing Performed:** Cross-checked every field/component name
written into `.ai/prompts/lesson.md` and `CLAUDE.md` against the literal
source in `src/lib/schema.ts` and `src/components/mdx/index.ts` — exact
match, no drift. Re-ran the full validation suite after the doc-only changes
to confirm nothing was inadvertently broken.

**Validation Results:**
- `pnpm build` — pass
- `pnpm lint` — pass
- `pnpm typecheck` — pass

**Known Limitations:** None — this milestone is documentation-only, per its
own scope (`implementation-roadmap.md` M14: "Files to modify: None").

**Next Milestone:** M15 — Developer Experience & Maintenance Jobs.

---

## M15 — Developer Experience & Maintenance Jobs (2026-07-29)

**Completed Work:** A scheduled, non-blocking weekly link checker
(GitHub Actions + lychee), and a maintenance doc covering dependency-update
cadence and manual Lighthouse-check triggers.

**Files Created:**
- [.github/workflows/link-check.yml](./.github/workflows/link-check.yml) —
  runs [lychee](https://lychee.cli.rs/) (via `lycheeverse/lychee-action@v2`)
  against `content/**/*.mdx` and the project's `.md` files every Monday
  06:00 UTC, plus on-demand via `workflow_dispatch`. Never runs on
  push/PR, never fails the job — a broken link only opens a GitHub issue
  (`peter-evans/create-issue-from-file@v5`) with the report.
- [docs/maintenance.md](./docs/maintenance.md) — documents the link-check
  job's behavior (including that it opens a new issue per run rather than
  updating one in place — a real limitation worth knowing, not hidden),
  the quarterly/batched dependency-update process, and when to run a manual
  Lighthouse check.

**Files Modified:** None in `src/` or `content/`, per the milestone's scope.

**Dependencies:** None added to `package.json` — used a GitHub Action
(`lycheeverse/lychee-action`) instead of an npm devDependency. This is a
deliberate deviation from the roadmap's literal "dev dependency" wording:
it satisfies the actual goal (a scheduled, non-blocking link checker) with
zero footprint in `package.json` and nothing to version-bump quarterly,
which is more aligned with the architecture doc's "every dependency is a
recurring cost" principle than adding a CLI package would have been. Not an
architectural change — CLAUDE.md's "never introduce a new dependency
without approval" rule concerns app dependencies; this doesn't touch
`package.json` at all.

**Architecture Rules Followed:**
- Scheduled only (`schedule` + `workflow_dispatch`) — no `push`/
  `pull_request` trigger, confirmed by reading back the parsed YAML.
- `fail: false` on the lychee step — a broken external link cannot fail the
  job or block a deploy (architecture doc §13/§17).
- No Dependabot or auto-merge automation introduced anywhere.
- Lighthouse documented as manual, triggered by specific change types
  (layout/CSS/fonts/whitelist components/client JS), not automated CI
  (§14 explicitly calls automated Lighthouse CI overkill here).

**Manual Testing Performed:** Parsed the workflow YAML locally
(`js-yaml`) to confirm it's syntactically valid and structured as intended
(triggers, permissions, step order). Could not trigger an actual GitHub
Actions run from this environment — that requires the workflow to exist on
the remote first.

**Validation Results:**
- `pnpm build` — pass
- `pnpm lint` — pass
- `pnpm typecheck` — pass

**Definition of Done — confirmed:** pushed to `main`, manually triggered via
`workflow_dispatch` from the Actions tab. Run #1 completed with status
**Success** in 16s, found no broken links, created no issue, blocked
nothing. Only annotation was GitHub's generic Node.js 20 deprecation notice
on `actions/checkout@v4`; bumped to `@v5` afterward (trivial, no-risk
version bump on an already-used action, not a new dependency).

**Next Milestone:** M16 — Launch Content: First 3 Published Lessons.
