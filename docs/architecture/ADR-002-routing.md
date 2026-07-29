# ADR-002: Routing Strategy

**Status:** Accepted — immutable. A change to this decision requires a new
ADR (marking this one superseded), never an edit in place.

## Context

URLs on a content site are a long-term SEO and bookmarking commitment. A
solo-maintained project that expects to run for years cannot afford a
routing scheme that needs restructuring as content grows from 3 lessons to
300.

## Decision

Routes mirror the content folder structure exactly, with a maximum depth of
two segments:

```
/                      landing + category map
/[category]            category index, lessons ordered by frontmatter `order`
/[category]/[slug]     lesson page
/tags/[tag]            tag listing
/search                client-island search UI (see ADR-003)
```

All lesson/category/tag routes are generated via `generateStaticParams`,
producing fully static HTML. Only `status: published` lessons produce a
route; `draft`/`review` lessons build successfully but are unreachable in
production. If a slug must ever change, a redirect entry is added to the
(currently empty) `redirects` array in `next.config.ts` — that one array is
the entire "URL management system."

## Alternatives Considered

- **Deeper hierarchies** (e.g. `/[category]/[subtopic]/[slug]`) for
  sub-topics. Rejected — sub-structure is already expressed through `order`
  and `tags[]`; a third URL segment would force a painful migration the
  first time content gets reorganized, which is expected to happen
  repeatedly over years of authoring.
- **Filename-prefix ordering** (`01-closures`, `02-hoisting`) instead of a
  frontmatter `order` field. Rejected — renaming a file to reorder it is
  noisy in Git history and racy across concurrent edits; a frontmatter field
  is a one-line diff.

## Consequences

- The mental model is "the URL is the file path" — there is no routing logic
  to maintain beyond the content gateway's listing/filtering functions.
- `generateMetadata` must be present on every route (not just the lesson
  page) since there is no other place metadata could live.
- Any future change to the `[category]`/`[slug]` shape is an architectural
  change per ADR-001's contract and requires the same review this document
  received.
