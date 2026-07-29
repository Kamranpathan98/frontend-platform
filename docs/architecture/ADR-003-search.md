# ADR-003: Search Strategy

**Status:** Accepted — immutable. A change to this decision requires a new
ADR (marking this one superseded), never an edit in place.

## Context

The site needs keyword search across a growing set of static lesson pages,
without adding a server, an account with an external service, or a client
bundle that grows linearly with content — for a solo maintainer, "search"
must not become a second thing to operate.

## Decision

**Pagefind**, run as a build-chained step, not a service:

```
"build": "next build && pagefind --site .next/server/app --output-path public/pagefind"
```

Pagefind indexes the *rendered HTML output* of `next build` after the fact.
The `/search` route (`src/app/search/page.tsx`) is a client island
(`SearchBox`) that lazily loads Pagefind's index fragments and queries them
in the browser — no server round-trip, no API route. Lesson pages expose
category/tag data via `data-pagefind-filter` attributes for filtered search.

## Alternatives Considered

- **Algolia DocSearch.** Free for OSS and genuinely better ranking/typo
  tolerance, but requires an application process, an external account, and a
  crawler configuration to maintain. Documented as a future upgrade
  (architecture doc §9) *if* traffic ever justifies it — not adopted now
  because it solves a scale problem this project doesn't have yet.
- **Client-side FlexSearch/Fuse.** Requires building and shipping the search
  index yourself; index size grows with content and ships inside the JS
  bundle, directly working against the site's near-zero-JS performance
  budget (architecture doc §14).
- **Self-hosted Meilisearch/Typesense/Elastic.** A search *server* — uptime,
  upgrades, and hosting cost for a feature Pagefind delivers as a static
  build artifact. Explicitly ruled out in the architecture doc as something
  this project should never need.

## Consequences

- The search index is a build artifact (`public/pagefind`), not something
  wired into `dev`. Because Pagefind indexes *built* HTML, correctness must
  be verified against a real `next build` (or a Vercel preview), never
  assumed from dev-mode behavior alone.
- Filtering depends on `data-pagefind-filter` attributes staying present on
  lesson templates; removing them silently degrades filtering without
  breaking the build, so it's a manual-testing item, not something the type
  system catches.
- Migrating to DocSearch later is a UI-layer swap only — the content
  pipeline this ADR governs does not change.
