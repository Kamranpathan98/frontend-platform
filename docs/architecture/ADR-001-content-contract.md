# ADR-001: Content Contract

**Status:** Accepted — immutable. A change to this decision requires a new
ADR (marking this one superseded), never an edit in place.

## Context

Content must survive years of solo, AI-assisted authoring: ChatGPT drafts
prose, Claude Code places files, only the human ships to production. Whatever
holds a lesson has to be something all three can read and write reliably,
must fail loudly on mistakes (at build time, not in production), and must
never force an all-or-nothing rewrite when the shape of a lesson changes.

## Decision

A lesson is **one folder, one `index.mdx` file**, with Zod-validated YAML
frontmatter and a body organized by plain `##` headings — never custom
per-section components.

- Frontmatter fields (`src/lib/schema.ts`): `schemaVersion`, `title`,
  `description`, `category`, `tags[]`, `difficulty`, `order`, `related[]`,
  `updatedAt`, `status`. Validated by `lessonFrontmatterSchema`
  (`zod`) inside `src/lib/content.ts`, the only module that reads
  `content/lessons/`.
- Body sections (Concept, Why, Internal Working, Visual Explanation,
  Examples, Interview Questions, Common Mistakes, Summary, Related Topics,
  Next Lesson, Revision Notes, Exercises) are a **convention**, encoded in
  `scripts/new-lesson.ts`'s scaffold template — not enforced by the schema. A
  lesson missing a section must still build as `draft`.
- `status` is a three-state lifecycle: `draft` → `review` → `published`. AI
  tools may create `draft` and promote to `review`; only a human commit
  promotes to `published`. Draft/review lessons are excluded from production
  listings via `filterPublished()`.
- Schema evolution is additive by default. A breaking change bumps
  `schemaVersion` and gets a pure `v1 → v2` upgrade function applied at build
  time — never a mass edit of existing files.

## Alternatives Considered

- **Headless CMS (Contentful/Sanity/Payload).** Adds an account, an API, a
  schema UI, and a second source of truth — none of which the actual authors
  (a human + two LLMs, all fluent in Markdown/files) need. Would make the AI
  workflow strictly worse: an LLM writes a file perfectly, but can't reliably
  write to a CMS API.
- **Per-section MDX components** (e.g. `<Concept>...</Concept>` per
  heading). Rejected — couples every lesson to a component API that changes
  over time, and AI-generated content would silently break on a typo'd tag
  name. Headings are unbreakable, render correctly even on raw GitHub, and
  still drive the table of contents via the heading tree.

## Consequences

- Malformed frontmatter fails `pnpm build` loudly, never reaches production.
- `content/lib.ts` is the single content gateway; any future page, sitemap,
  or search feature must read through it, never touch the filesystem
  directly (authoring-time scripts like `scripts/new-lesson.ts` are the
  documented exception — see their own inline comments).
- At most one live schema-upgrade function exists at a time; a second
  breaking change must wait for the first to be retired first.
