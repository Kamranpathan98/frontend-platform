# Frontend Learning Platform — Architecture Document

**Role:** Principal Architect review
**Optimized for:** One developer, AI-assisted workflow, interview prep as the primary job
**Success metric:** Learn → write lesson → commit → deployed, with zero platform friction, for years.

---

## 1. Executive Summary

Build a **statically-generated MDX content site** with **Next.js (App Router) + Tailwind + shadcn/ui**, content stored as **plain MDX files in the Git repo**, **build-time search (Pagefind)**, **Sandpack playgrounds**, deployed to **Vercel** on every push to `main`.

There is no backend, no database, no CMS, no auth, no API layer. The repository *is* the database. Publishing a lesson is `git push`. Everything dynamic in the future (progress, quizzes, AI tutor) is designed as an **additive layer** that never touches the content pipeline.

The single most important architectural decision in this document is not a technology — it is this invariant:

> **A lesson is one folder containing one MDX file with validated frontmatter. Nothing else is ever required to publish.**

Every other choice below exists to protect that invariant.

Why Next.js and not a "purer" content tool like Astro? Because the platform's audience — and its author — are React frontend engineers. The site itself becomes interview practice: App Router, RSC, streaming, image optimization, and performance work are all résumé-relevant. That dual-use benefit outweighs Astro's marginally better content ergonomics. (Astro is the documented fallback; see §20.)

---

## 2. Engineering Principles

Everything else in this document is derived from these. When a future decision isn't covered here, decide by these principles rather than by precedent, fashion, or enthusiasm:

1. **Interview preparation comes before platform development.** The platform is a byproduct of learning, never a competitor to it.
2. **Content is the product.** The app is packaging. Invest accordingly.
3. **The repository is the source of truth.** If it isn't in Git, it doesn't exist — content, prompts, decisions, conventions.
4. **One lesson equals one folder.** Self-contained, portable, deletable.
5. **The simplest maintainable solution wins.** Not the simplest possible (that rots), not the most elegant (that costs) — the simplest that survives years of neglect.
6. **Platform work must reduce future friction.** Building for its own sake is deferred burnout.
7. **Every feature must justify its recurring maintenance cost**, not just its build cost. Build cost is paid once; maintenance is paid forever.
8. **Avoid accidental complexity.** Essential complexity lives in lessons; the platform should have almost none.
9. **Prefer boring technology.** Excitement belongs in the content, not the stack.
10. **Optimize for one developer** — including the future, tired, out-of-context version of that developer.

These are written as timeless rules deliberately: they must still be the correct tiebreakers in year three, when the original context has faded and an AI assistant (or a contributor) proposes something locally reasonable and globally wrong.

---

## 3. Technology Stack

| Layer | Choice | One-line reason |
|---|---|---|
| Framework | Next.js 15+ (App Router, SSG-first) | React ecosystem, static output, résumé-relevant |
| Language | TypeScript (strict) | AI tools produce far safer code with types |
| Content | MDX files in-repo | Git-native, zero infra, AI-writable |
| Content typing | Zod-validated frontmatter (via content-collections or a small custom loader) | Broken frontmatter fails the build, not production |
| Styling | Tailwind CSS | No design skills needed; AI generates it reliably |
| Components | shadcn/ui (Radix primitives) | Owned code, not a dependency; accessible by default |
| Code highlighting | Shiki via rehype-pretty-code | Build-time, zero client JS, VS Code quality |
| Playgrounds | Sandpack (@codesandbox/sandpack-react) | Real bundling in-browser, no server |
| Search | Pagefind | Build-time static index, no service, scales to thousands of pages |
| Theme | next-themes | Solved problem; don't rebuild it |
| Diagrams | Mermaid in MDX (+ static SVG when needed) | Text-based → diffable → AI-generatable |
| Hosting | Vercel (Hobby/OSS) | Push-to-deploy, zero DevOps |
| Analytics | None initially; Vercel Analytics or Plausible later | Not on the critical path |

### Why each — and why not the alternatives

**Next.js vs Astro.**
Astro is objectively excellent for content sites: content collections, zero-JS default, islands. If this were *only* a documentation site, Astro wins. Two things flip the decision:

1. *Skill alignment.* You are preparing for frontend interviews. Time spent in Next.js compounds into interview readiness; time spent learning Astro's model does not (yet).
2. *Interactive ceiling.* Playgrounds, visualizations, quizzes, and an eventual AI tutor are React-heavy. In Astro you'd wrap React islands anyway; in Next.js it's native.

Trade-off accepted: you ship more baseline JavaScript than Astro would. Mitigation: SSG everything, keep client components at the leaves (§14). Migration path: because content is plain MDX + frontmatter, moving to Astro later is a rendering-layer swap, not a content migration (§16).

**Next.js vs Docusaurus/Nextra/VitePress.**
These get you 80% on day one and then fight you on the last 20% (custom lesson layouts, playgrounds, quizzes, non-docs IA). For a multi-year project, owning the rendering layer beats renting it. Docusaurus also locks you into its plugin lifecycle and theme swizzling — exactly the kind of "framework archaeology" a solo dev can't afford in year 3.

**MDX-in-repo vs headless CMS (Contentful/Sanity/Payload).**
A CMS adds: an account, an API, a schema UI, webhooks, rate limits, and a second source of truth. It removes: nothing you need. Your authors are you + ChatGPT + Claude Code — all of whom write Markdown natively. A CMS would make the AI workflow *worse* (AI can't easily write to a CMS; it writes files perfectly). Content in Git also gives you free versioning, review via PRs, and community contributions later.

**Tailwind vs CSS Modules / styled-components.**
Solo dev, no designer. Tailwind + shadcn gives a coherent design system without design decisions. Critically, LLMs generate correct Tailwind at a much higher rate than bespoke CSS architectures. styled-components adds runtime cost and is effectively in maintenance mode. Trade-off: markup verbosity — acceptable.

**shadcn/ui vs MUI/Chakra/Mantine.**
shadcn copies components *into your repo*. No version upgrades ever forced on you, no breaking API changes in year 2, full control for lesson-specific components. Component libraries as dependencies are a long-term liability for a one-person project.

**Pagefind vs Algolia DocSearch vs FlexSearch.**
- *Algolia DocSearch:* free for OSS and excellent, but it's an external service, an application process, a crawler config, and an account to maintain. Fine as a later upgrade; wrong as a foundation.
- *FlexSearch/Fuse client-side:* you must build and ship the index yourself; index size grows with content and lands in the JS bundle.
- *Pagefind:* runs after `next build`, indexes the HTML output, lazily loads index fragments (~10–100 KB even for large sites), needs zero configuration and zero services. It is the boring, correct choice.

**Sandpack vs StackBlitz WebContainers vs custom iframe runner.**
Sandpack bundles in-browser, supports React/TS/CSS templates, is a maintained OSS project from CodeSandbox, and embeds as a React component. WebContainers are heavier and gated for commercial use. A custom runner is a project in itself — exactly the over-engineering to avoid. Trade-off: Sandpack loads ~1–2 MB lazily; mitigation is lazy-mounting on scroll/click (§14).

**Vercel vs Cloudflare Pages vs GitHub Pages.**
Vercel: first-class Next.js, preview deployments per PR (your human-review step), free tier sufficient. GitHub Pages requires full static export and forfeits future server features (OG image generation, future API routes for the AI tutor). Cloudflare Pages is the documented escape hatch if Vercel pricing/limits ever become a problem — low switching cost because the app is SSG.

---

## 4. High-Level Architecture

```
┌─────────────────────────── GIT REPOSITORY ───────────────────────────┐
│                                                                      │
│   /content (MDX + frontmatter)        /src (Next.js app)             │
│         │                                   │                        │
│         └────────────┬──────────────────────┘                        │
│                      ▼                                               │
│               next build (CI on Vercel)                              │
│         1. Zod validates all frontmatter  ── fails build if broken   │
│         2. MDX → static HTML (Shiki, Mermaid at build time)          │
│         3. Generates sitemap, RSS, OG images                         │
│         4. Pagefind indexes the HTML output                          │
│                      ▼                                               │
│               Static assets on Vercel CDN                            │
└──────────────────────────────────────────────────────────────────────┘
                       ▼
                  Browser
        - Static HTML (instant, SEO-perfect)
        - Islands of interactivity: theme, search UI,
          Sandpack playgrounds (lazy), future quizzes
        - localStorage for future progress (no server)
```

Key properties:

- **Single build pipeline, single artifact.** No runtime content fetching, no ISR complexity, no cache invalidation problems. A deploy is immutable.
- **Failure surface ≈ zero.** With no server and no database, the only things that can break are the build (caught in CI, on *your* time) and the CDN (Vercel's problem).
- **The dependency arrow points one way:** content never imports from the app; the app reads content. This is what makes the rendering layer replaceable.

---

## 5. Folder Structure (with reasoning)

```
/
├── content/                      # THE product. Everything else serves this.
│   └── lessons/
│       └── javascript/
│           └── closures/
│               ├── index.mdx     # the lesson (frontmatter + body)
│               └── assets/       # images/SVGs co-located with the lesson
├── src/
│   ├── app/                      # routes only — thin
│   ├── components/
│   │   ├── ui/                   # shadcn primitives (owned code)
│   │   ├── mdx/                  # components available inside lessons
│   │   └── layout/               # shell: sidebar, header, footer
│   ├── lib/
│   │   ├── content.ts            # THE only module that reads /content
│   │   └── schema.ts             # Zod frontmatter schema
│   └── styles/
├── docs/
│   └── architecture/             # ADRs (§18) — decisions, numbered, immutable
│       ├── ADR-001-content-contract.md
│       ├── ADR-002-routing.md
│       └── ADR-003-search.md
├── .ai/
│   └── prompts/                  # versioned prompt library (§19)
│       ├── lesson.md
│       ├── implementation.md
│       ├── review.md
│       ├── quiz.md
│       └── diagram.md
├── scripts/
│   └── new-lesson.ts             # scaffolds a lesson folder in <1s
└── public/
```

Reasoning:

- **`/content` outside `/src`:** content is data, not code. This physical separation is what keeps the framework swappable and lets AI tools touch content without risking the app (and vice versa).
- **Folder-per-lesson with co-located assets:** a lesson is self-contained and portable. Deleting/moving a lesson can never orphan images. This matters enormously at 200+ lessons.
- **One content gateway (`lib/content.ts`):** every page, the sitemap, RSS, search metadata, and related-lesson logic read content through one module. When you later add a content layer tool or swap frameworks, you change one file.
- **`components/mdx/` as an explicit contract:** the set of components lessons may use is a deliberate, small API surface. It's also the exact list you hand to ChatGPT/Claude in prompts ("you may use: <Playground>, <Callout>, <Quiz>, <Figure>, <Diagram>").
- **`docs/architecture` and `.ai/prompts` in-repo:** decisions and prompts are project assets with the same lifecycle as code — they must be versioned, reviewable, and available to every collaborator (human or AI) via the one shared interface: files. Details in §18 and §19.
- **No `utils/`, `helpers/`, `services/`, `hooks/` sprawl:** premature folders invite premature abstraction. Add folders when a third file needs a home, not before.

---

## 6. Content Architecture

### The lesson contract

Frontmatter (Zod-validated at build; build fails loudly on violation):

```
schemaVersion: 1
title, description, category, tags[], difficulty,
order, related[], updatedAt,
status: draft | review | published
```

Body sections map 1:1 to your list (Concept, Why, Internal Working, Visual Explanation, Examples, Interview Questions, Common Mistakes, Summary, Related Topics, Next Lesson, Revision Notes, Exercises) — implemented as **plain `##` headings, not custom components**.

This is a deliberate and important decision:

- **Headings, not components:** if each section were `<Concept>...</Concept>`, every lesson would depend on a component API that will change, and AI-generated lessons would break on typos in tag names. Headings are unbreakable, render everywhere (including raw GitHub), and still power the table of contents via the heading tree.
- **Sections are conventions, not validation rules.** A lesson missing "Common Mistakes" must still build. The template scaffold (`scripts/new-lesson.ts`) encodes the structure; the build does not enforce it. Enforcement would violate the prime constraint — you'd be blocked from publishing a half-finished lesson after a study session.
- **`related[]` is explicit, not computed.** Tag-similarity algorithms produce mediocre suggestions and add build complexity. You just studied the topic — you know the three related lessons. Explicit wins for quality and simplicity. (A "same category + shared tags" fallback fills the gap when `related` is empty — 10 lines of code, good enough.)
- **Taxonomy:** `category` (one, mirrors the folder: javascript, css, react, browser, system-design…) drives the sidebar; `tags` (many) drive cross-cutting discovery. Two axes, no more. Hierarchies deeper than category/lesson are a maintenance trap.

### Schema versioning

Every lesson carries `schemaVersion: 1`. This one line is cheap insurance against the most expensive event in this project's future: a breaking change to the lesson contract after 200 lessons exist.

- **Why it matters:** without a version marker, a schema change forces an all-or-nothing migration in one sitting — exactly the kind of platform work that steals a week of study time. With it, old and new lessons coexist and the build knows how to treat each.
- **Non-breaking changes** (new optional field, new enum value): schema version stays the same. The Zod schema simply gets more permissive. This should be ~95% of all schema evolution.
- **Breaking changes** (renamed field, changed semantics): bump to `schemaVersion: 2`, and the Zod layer in `lib/schema.ts` gains a pure **upgrade function** (`v1 → v2`) applied at build time. Old files on disk remain untouched and valid; they're upgraded in memory during the build. No flag day, no mass edit, no risk to Git history.
- **Retiring a version:** when convenient (a rainy afternoon, or a Claude Code batch job), run a one-shot codemod that rewrites v1 files to v2 on disk in a single reviewable PR, then delete the upgrade function. Git-friendly by construction: one commit, mechanical diff, trivially revertible.
- **Discipline:** at most one live upgrade function at a time. If a second breaking change looms before the first migration is retired, retire the first one first. Version sprawl is how "simple insurance" becomes a compatibility museum.

### Lesson lifecycle

`status` replaces the earlier boolean `draft` flag with three states — the minimum that matches how lessons actually move through the AI workflow:

- **`draft`** — scaffolded and/or AI-generated, not yet verified. Excluded from production builds, sitemap, RSS, and search. Committing drafts freely is encouraged: half-finished work after a study session belongs in Git, not in stash purgatory.
- **`review`** — content complete; awaiting the one human pass (technical claims + interview answers). Still excluded from production, but *included in preview deploys*, which is precisely where review happens. This state exists so "written" and "verified" are never confused — the honest failure mode of AI-generated content.
- **`published`** — live. Set by the human, and only the human, typically in the merge commit itself.

Who changes what: ChatGPT/Claude Code may create lessons only as `draft` and may promote `draft → review` when generation is complete. Only the human promotes to `published`. This rule costs nothing to follow and makes "did a human actually check this?" answerable from Git history alone.

Friction check: publishing overhead is unchanged — editing one word in frontmatter during the review you were doing anyway. What it adds is a truthful map of the pipeline: at any moment, `grep -r "status: review"` is your review queue.

### Ordering
`order` in frontmatter per category. Boring, explicit, mergeable. Alternatives (filename prefixes like `01-`, separate manifest files) either make renames noisy in Git or create a second file to forget updating.

---

## 7. Routing Strategy

```
/                          → landing + category map
/[category]                → category index (lesson list, ordered)
/[category]/[slug]         → lesson page
/tags/[tag]                → tag listing
/search                    → search UI (client island over Pagefind)
```

- URLs mirror the content folder structure exactly. The mental model is "the URL is the file path" — zero routing logic to maintain, and slugs are stable forever (SEO).
- All lesson routes via `generateStaticParams` → fully static HTML.
- Max depth of two segments. Sub-topics are expressed with `order` + tags, not deeper URLs. Deep hierarchies force painful URL migrations when you inevitably reorganize.
- If a slug must ever change, a redirect entry in `next.config` preserves SEO. Keep a tiny `redirects` list — that's the whole "URL management system."

---

## 8. MDX Strategy

- **Compile at build time** (via the content layer / `@next/mdx`-style pipeline). Never compile MDX in the browser; never fetch MDX at runtime.
- **Plugins — the minimal proven set:** `remark-gfm` (tables), `rehype-slug` + autolink (heading anchors → ToC), `rehype-pretty-code`/Shiki (highlighting, line highlights, titles, diff notation). Each plugin added is a build dependency you maintain for years — the bar for adding more is high.
- **Component whitelist** (the `components/mdx/` contract): `<Playground>`, `<Callout type>`, `<Figure>`, `<Diagram>` (Mermaid), later `<Quiz>`. Anything not on the list doesn't exist for content. This keeps lessons portable and keeps AI generation reliable — the prompt includes the component list and their props, nothing else is legal.
- **Graceful degradation rule:** every custom component must render *something sensible* if its client JS fails or is removed — e.g., `<Playground>` wraps plain code blocks that render as static highlighted code without JS. This future-proofs 200 lessons against any single component's demise.
- **Code blocks by default; playgrounds by choice.** Static Shiki blocks are free. A Sandpack playground is opt-in per snippet, because each one costs load weight. The lesson author (you) marks the 1–2 snippets per lesson worth making live.

---

## 9. Search Strategy

**Phase 1 (launch): Pagefind.**
Post-build step indexes rendered HTML. UI is a small client island: input → Pagefind's lazy-loaded fragments → results with highlighted excerpts. Frontmatter fields (category, tags) are exposed to Pagefind via data attributes for filtered search. Zero services, zero config drift, works offline in dev.

**Phase 2 (optional, if the site gets real traffic): Algolia DocSearch.**
Free for OSS, better ranking and typo tolerance. It's a UI-layer swap — the content pipeline doesn't change. Do not do this before ~100 lessons; it solves a scale of problem you won't have.

**Never:** self-hosted Meilisearch/Typesense/Elastic. A search *server* means uptime, upgrades, and cost for a feature Pagefind delivers statically.

---

## 10. Component Architecture

Three strict layers, dependency arrows pointing down only:

```
layout/        (app shell: sidebar, header, ToC rail, footer)
   ↓ uses
mdx/           (lesson-facing: Playground, Callout, Quiz, Figure…)
   ↓ uses
ui/            (shadcn primitives: button, card, tabs, dialog…)
```

- **Server Components by default.** Client components (`"use client"`) only at true interactivity leaves: theme toggle, search box, Sandpack mount, quiz. This is both the performance strategy and, conveniently, modern-React interview practice.
- **No component abstraction until the third duplication.** Two similar components are cheaper to maintain than one wrong abstraction. This rule matters more for a solo dev than any pattern.
- **Props over context.** Context only for theme. Anything else is YAGNI at this app's depth.
- **Sandpack isolation:** `<Playground>` is the only file that imports Sandpack. If Sandpack dies or a better tool appears, one file changes, zero lessons change.

---

## 11. Design System

- **Don't build one. Adopt one.** shadcn/ui + Tailwind theme tokens *is* the design system. Your customization budget: one accent color, one font pairing (e.g., Inter + JetBrains Mono), spacing defaults. Stop there.
- **Typography is the product.** People read lessons for 20+ minutes; invest the small effort in `@tailwindcss/typography` (`prose`) tuned for line length (~70ch), code block contrast, and comfortable heading rhythm. This is 90% of perceived quality.
- **Dark mode:** class strategy via next-themes + CSS variables from shadcn's token system. Shiki dual-theme handles code blocks. Solved problem, ~1 hour, never touched again.
- **Mobile:** the sidebar collapses to a drawer (shadcn Sheet); everything else is single-column prose, which is mobile-friendly by nature. No separate mobile design effort.

---

## 12. State Management

**There is no global state.** This is a feature, not an omission.

- Server state: none — content is static.
- Theme: next-themes.
- Search input/results: local component state.
- Sidebar open/closed: local state.
- Future progress tracking: **localStorage behind a tiny `useProgress` hook** — completed-lesson IDs, nothing more. No accounts, no sync, no backend. The hook is the seam: if real auth+sync ever arrives, the hook's implementation changes and its consumers don't.

Redux/Zustand/Jotai would each be solving a problem this application does not have. Adding one "for the future" is the canonical solo-dev trap: you maintain the pattern forever and it shapes every component around a need that never materializes.

---

## 13. Deployment Strategy

- **Vercel, Git-integrated.** `main` → production. PR → preview URL (this preview *is* your human review step — you read the rendered lesson, not the diff).
- **CI is the build itself** plus two cheap gates: `tsc --noEmit` and the Zod frontmatter validation (which runs inside the build anyway). Add a link checker as a *scheduled weekly* job, not a merge blocker — a dead external link must never stop a lesson from shipping.
- **No staging environment, no environment variables, no secrets.** There is nothing to configure because there is nothing dynamic.
- **Rollback = redeploy previous commit** (one click in Vercel). Immutable static deploys make bad releases a non-event.
- Escape hatch: the site must always pass `next build` with static output so Cloudflare Pages / Netlify / GitHub Pages remain 1-day migrations. Concretely: avoid Vercel-only APIs in core paths; anything Vercel-specific (analytics, OG image edge function) must be deletable without touching lessons.

---

## 14. Performance Strategy

Static HTML from a CDN is already 95% of the win. The remaining 5%:

1. **JS budget discipline:** lesson pages ship ~0 KB of lesson-specific JS by default. Interactivity is opt-in per component.
2. **Sandpack lazily mounted** — a static code block + "Run" affordance (or intersection-observer mount). This is the single biggest performance decision on the site; eager Sandpack would add megabytes to first load.
3. **Shiki + Mermaid at build time** — syntax highlighting and diagrams as pre-rendered HTML/SVG, zero client cost. (Client-side Mermaid is the common mistake here; don't.)
4. **`next/image` + `next/font`** — sized images, self-hosted fonts, no CLS.
5. **Measure only when it matters:** Lighthouse CI is overkill; a manual Lighthouse run when you change layout code is enough. Performance regressions in a static site come from *components you add*, not entropy.

Targets: LCP < 1.5s on 4G, CLS ≈ 0, lesson page < 100 KB JS before playground interaction.

---

## 15. SEO Strategy

Structural (one-time):
- Static HTML for every lesson (already guaranteed by SSG) — content is in the initial response, not hydrated in.
- Metadata API per lesson from frontmatter: title, description, canonical, OpenGraph/Twitter.
- Auto-generated **sitemap.xml + RSS** from the content gateway module.
- **JSON-LD** (`Article` / `TechArticle` + `BreadcrumbList`) generated from frontmatter — free rich results, ~30 lines of code once.
- OG images auto-generated from title/category (Vercel OG). Nice CTR win, zero per-lesson work.
- Stable URLs forever (§7) + redirects file for any renames.

Content SEO (free byproduct of your format): interview questions in lessons naturally match long-tail queries people actually search ("how does closure work interview question"). The "Summary" section doubles as a snippet-friendly answer block. No extra work — the lesson structure *is* the SEO strategy.

---

## 16. Future Extensibility (without touching current simplicity)

The rule for every future feature: **additive layers only; the content contract never changes.**

| Feature | How it lands later | Why it costs nothing now |
|---|---|---|
| Quizzes | `<Quiz>` MDX component, questions inline in the lesson | Whitelist gains one entry; old lessons unaffected |
| Visualizations | Per-lesson React components rendered via the MDX whitelist | Contained to `components/mdx/` |
| Progress tracking | `useProgress` + localStorage (§12) | No backend; hook is the future seam |
| Auth + sync | Supabase (or similar) *behind* `useProgress` | Only when real users demand it; content untouched |
| AI tutor | One API route (or edge function) calling an LLM with the current lesson's MDX as context | The repo-as-content design means the tutor's knowledge base already exists |
| Community contributions | Already works: PRs against `/content`; add CONTRIBUTING.md + lesson template | Zod validation + preview deploys are your review tooling |
| i18n | `content/lessons/<locale>/…` if ever needed | Deliberately *not* pre-built — real cost, speculative benefit |

Framework migration path (the ultimate extensibility): because content is plain MDX + heading conventions + a small component whitelist, moving to Astro/whatever-2028-brings means rewriting `src/` (weeks) while `/content` — the accumulated years of work — moves unchanged.

---

## 17. Development Workflow

The publishing loop, end to end (target: **< 30 min from "done studying" to "deployed"**, of which < 5 min is platform overhead):

1. Study topic (the actual job).
2. `pnpm new-lesson javascript closures` → scaffolded folder with the section template.
3. Paste notes into ChatGPT with the lesson-generation prompt → MDX body.
4. Claude Code drops it in, fixes MDX/component usage, runs `pnpm build` locally.
5. PR → Vercel preview → you *read the rendered lesson* (human review = reading, not code review).
6. Merge → live.

Guardrails that protect the loop:
- The scaffold script is the template's source of truth (update the template there, not in docs).
- The `status` lifecycle (§6) keeps unfinished work committable: `draft` and `review` lessons never reach production, so Git hygiene never blocks study flow, and the preview deploy always shows exactly what awaits your review.
- Dependency updates: **quarterly, batched, on a calm day.** Never let Dependabot noise interrupt the study loop; a static site has near-zero security surface anyway.

---

## 18. Architecture Decision Records

This document is the founding decision set. ADRs are how the *next* major decisions get the same treatment without regenerating a 20-section document.

- **Why they exist (for a team of one):** the reviewer of every future decision is you-in-two-years, with no memory of the context, plus AI assistants with no memory at all. An ADR is a message to both. Without it, sound decisions get relitigated ("why not Astro again?") and unsound ones get repeated. For a solo project, ADRs are cheaper than for a team — no consensus process, just written thinking — and *more* valuable, because there's no colleague to remember the reasoning for you.
- **Where they live:** `docs/architecture/`, numbered and immutable once accepted. Superseded ADRs are marked superseded, never deleted — the history *is* the value.
- **Naming:** `ADR-NNN-short-slug.md` (`ADR-001-content-contract.md`, `ADR-002-routing.md`, `ADR-003-search.md`). Sequential, greppable, sortable.
- **Format:** deliberately minimal — Context, Decision, Alternatives considered, Consequences. Half a page. An ADR that takes more than 20 minutes to write is over-scoped or the decision is under-thought.
- **When to write one:** the decision is expensive to reverse, constrains future work, or contradicts something this document says. Litmus test: *"would future-me or an AI assistant plausibly undo this without knowing why it was done?"* Examples that qualify: changing the content contract, adding the first backend dependency, adopting DocSearch, bumping `schemaVersion`.
- **When NOT to:** component design, styling choices, refactors, dependency patch bumps, anything reversible in an afternoon. An ADR for every implementation detail turns a thinking tool into a paperwork tax — the failure mode that kills ADR practices everywhere. Expected volume here: a handful per *year*.

Strengthens the architecture because the invariants in this document are currently enforced only by memory. ADRs plus `CLAUDE.md` (§19) turn them into artifacts that outlive context — the difference between discipline and documentation of discipline.

---

## 19. AI Workflow (architecture implications)

The architecture is shaped so each AI has a clean, low-risk lane:

- **ChatGPT (content):** operates on *text only*. Its contract is the lesson template + component whitelist, delivered via `.ai/prompts/lesson.md` (see Prompt Library below) so the prompt evolves under version control. It never needs to know the app exists.
- **Claude Code (implementation):** operates on `/src` and on placing MDX files. Strict TypeScript + Zod + the three-layer component rule give it hard rails; the build catches its mistakes before you do. Its standing orders are the AI Contribution Contract below, encoded in `CLAUDE.md`.
- **Human:** reviews rendered previews, promotes `review → published`, and merges. You are the editor-in-chief, not the typist.

### The AI Contribution Contract

Rules binding on every AI tool touching this repository — today's and whatever replaces them. Canonical home: `CLAUDE.md` at repo root (with `.ai/prompts/implementation.md` referencing it), so the rules are injected into every session automatically rather than remembered per-conversation.

Never, without explicit human approval:
- introduce a new dependency;
- modify routing or URL structure;
- change the content schema or lesson contract;
- move or rename folders;
- introduce any backend technology (databases, auth, APIs, services);
- change an architectural invariant recorded in this document or an ADR.

Always:
- prefer existing components over creating new ones;
- preserve the lesson contract and the MDX component whitelist;
- keep the build passing — a change that breaks `pnpm build` is not done;
- create lessons as `draft`, promote at most to `review` (§6).

Why this protects long-term maintainability: AI assistants optimize locally — each individually reasonable suggestion (a helper library here, a folder reorganization there) compounds into exactly the entropy this architecture exists to prevent. And unlike a human teammate, an AI absorbs no culture between sessions: every conversation starts from zero. The contract converts your architectural judgment into persistent, machine-readable policy, which means the discipline holds even in month 30, at 11pm, when you'd approve anything just to finish. The "without approval" framing is deliberate — the rules aren't prohibitions but *escalation triggers*: the AI may propose any of these, and the proposal becomes a conscious human decision (often an ADR, §18) instead of a silent drift.

### Prompt Library

`.ai/prompts/` holds one file per recurring AI task: `lesson.md`, `implementation.md`, `review.md`, `quiz.md`, `diagram.md`.

- **Why version-controlled:** prompts are executable specifications of your quality bar. Left in chat history, every improvement ("always include a failure-mode example", "Mermaid, never ASCII diagrams") evaporates after the conversation ends, and quality resets to the model's defaults. In Git, improvements accumulate — the prompts get *better with every lesson published*, which is the only asset in an AI workflow that compounds.
- **Why they evolve with the project:** the lesson prompt embeds the component whitelist and section template; the implementation prompt embeds the contribution contract. When those change, the prompts change *in the same commit* — one source of truth, no drift between what the doc says and what the AI is told.
- **Consistency across collaborators:** ChatGPT, Claude Code, a future model, or a community contributor's AI all draw from the same files, so lesson #180 reads like lesson #8. For contributions (§16), the prompt library quietly becomes the style guide you never have to write.
- **Scope discipline:** five prompts, roughly one page each. A sprawling prompt "framework" would be the same over-engineering as a component library — resist it.

The deep reason MDX-in-repo beats every alternative for this project: **files are the only interface all three collaborators share natively.** Any CMS, database, or service would insert an interface that at least one collaborator handles badly.

---

## 20. Risks (honest ones)

1. **Abandonment via friction (the real killer).** Every risk below matters less than this: if publishing ever takes > 30 min of platform work, the platform dies. Mitigation is this entire document — and a personal rule: *any* recurring friction gets fixed in the scaffold/prompt within a week or the step gets deleted.
2. **Content-quality drift with AI generation.** AI lessons are fluent and sometimes wrong. Mitigation: the human review step reviews *technical claims*, not prose; interview questions get answered by you before publishing (which is, conveniently, studying).
3. **Sandpack dependency risk.** It's the least "boring" dependency in the stack. Mitigation: isolation to one component + graceful degradation to static code blocks (§8). Worst case: lessons lose live editing, lose nothing else.
4. **Next.js churn.** App Router APIs still move. Mitigation: minimal API surface (SSG + metadata + images only), quarterly upgrades, and the Astro escape hatch — content immunity means framework risk is bounded at "weeks of `/src` work," never "rewrite the content."
5. **Scope temptation.** The Future list (auth! AI tutor!) will whisper. Mitigation: §21 and the 2-year plan gate features behind *evidence* (traffic, requests), not enthusiasm.
6. **Vercel free-tier limits** if the site gets popular. Good problem; Cloudflare Pages migration is pre-planned and ~1 day.

---

## 21. What NOT to Build

- No CMS, admin panel, or web-based lesson editor — your editor is your editor.
- No database, no auth, no user accounts (until real users demand progress sync — measured in requests, not imagination).
- No microservices, queues, event buses, Kubernetes, Docker-in-dev — nothing to orchestrate.
- No custom design system, icon set, or bespoke component library beyond shadcn.
- No custom search server, recommendation engine, or "AI-powered related lessons."
- No comment system (link to GitHub Discussions if ever needed — it's free and moderated by GitHub).
- No newsletter infra, no analytics dashboards, no A/B testing.
- No monorepo/turborepo — one app, one package.
- No i18n scaffolding, no plugin architecture, no theming-for-others.
- No test suite for content, and only thin tests for code: type-checking + build success *is* the test suite for a static site. Unit-test only genuinely tricky logic (e.g., related-lesson fallback). A 300-test suite here is burnout with extra steps.

Each item above is something a competent team *would* build — and each would be rational at 10 engineers. At 1 engineer whose actual job is studying, every one of them is negative-value.

---

## 22. Two-Year Evolution Plan

**Phase 0 — Foundation (weeks 1–2, timeboxed hard):**
Repo, Next.js + Tailwind + shadcn, content gateway + Zod schema (with `schemaVersion` + `status` from day one), lesson template + scaffold script, `CLAUDE.md` contract + initial `.ai/prompts/`, ADR-001–003 (a one-hour extraction from this document), MDX pipeline with Shiki, sidebar/ToC layout, dark mode, deploy. Ship with 3 real lessons. *If week 3 arrives and you're still building platform, cut scope until you're not.*

**Phase 1 — Content velocity (months 1–6):**
Publish lessons; touch platform only to remove friction. Add Pagefind (~day 1 of this phase), Mermaid, RSS/sitemap/JSON-LD. Target: 40–60 lessons. Success metric: average publish overhead < 15 min.

**Phase 2 — Depth (months 6–12):**
`<Quiz>` component (inline data, no backend), localStorage progress, first custom visualizations for flagship topics (event loop, rendering pipeline), OG image generation. Consider DocSearch if traffic warrants. Target: 100+ lessons, the site is now genuinely useful to strangers.

**Phase 3 — Audience (months 12–18):**
CONTRIBUTING.md + lesson template docs → accept community PRs. Plausible analytics *only if* you'll act on it. Polish the 10 most-visited lessons. Your interviews are presumably done — the project's purpose shifts from "my prep" to "everyone's prep," and only now do audience features earn consideration.

**Phase 4 — Optional platform features (months 18–24, evidence-gated):**
Auth + synced progress (Supabase behind `useProgress`) *if* users ask. AI tutor as a single API route over the existing content *if* you want the project to grow. Explicitly acceptable outcome: the platform stays a beautifully maintained static site forever — that is success, not stagnation.

---

### Closing note

The architecture's sophistication is intentionally invisible: it lives in the invariants (content contract frozen, one content gateway, component whitelist, additive-only futures), not in the infrastructure. That's what "principal-level" means for a team of one — designing what you *won't* have to think about for the next two years.
