# Frontend Learning Platform — Implementation Roadmap

**Source of truth:** `frontend-learning-platform-architecture.md` (same directory)
**Status:** Awaiting approval — no implementation has started.
**Rule:** One milestone per Claude Code session. Stop after each milestone for review before continuing. See "Implementation Execution Rules" below for the full execution policy.

---

## Implementation Execution Rules

Every milestone in this roadmap represents one production PR. The loop is the same for every milestone, starting with Milestone 1:

```
Implement → Push → Preview Deployment → Review → Merge → Next Milestone
```

This is possible from Milestone 1 onward because M2 (Deployment Pipeline) establishes automatic preview deployments before any feature work begins.

**Core rules:**
- Implement one milestone only, in one session.
- Never continue automatically to the next milestone.
- Stop immediately after completing the milestone and its Milestone Completion Report.
- Wait for explicit human review and approval before starting the next milestone.
- Never implement future milestones proactively, even if the next step seems obvious.
- Never introduce work outside the approved milestone's stated scope.
- Never make incidental "while I'm here…" improvements, refactors, or fixes — file them for a future milestone instead.

**Splitting an oversized milestone:** If Claude determines a milestone has become too large for one implementation session, it may propose splitting it into smaller milestones (e.g., `M7A`, `M7B`, `M7C`). Any such split must:
- preserve the architecture;
- preserve milestone order;
- still produce independently buildable software at each step.

Claude must request and receive explicit approval for the split before implementing any part of it.

**Architecture Safety Rule:** If implementation reveals an unexpected technical limitation, framework issue, dependency conflict, or architectural uncertainty that requires changing the approved architecture:
- Stop immediately.
- Do not make architectural decisions independently.
- Explain the issue.
- Propose one or more alternatives.
- Wait for explicit human approval before continuing.

Implementation decisions are allowed. Architecture decisions always require approval. This rule is part of the permanent execution policy and applies to every milestone.

---

## Roadmap Structure Notes (deviations from the literal expected order)

- **"Project structure" is folded into Milestone 1 (Bootstrap).** Empty folders with no logic aren't independently testable or reviewable as a PR — they only earn their place once something reads or writes to them. Bootstrap already needs `src/app` to exist; the rest of the skeleton (`content/`, `docs/`, `.ai/`, `scripts/`) is one extra `mkdir` pass in that same PR, not a separate milestone.
- **"Navigation" and "Sidebar" are merged into one milestone (M9).** §5 of the doc places both under `components/layout/`, and neither is meaningfully testable until the content gateway (M6) exists to feed them real category/lesson data. Splitting them would produce one milestone with no data to render.
- **"Diagrams" (Mermaid) is folded into the MDX milestone (M7), not split out.** §8 explicitly groups `<Callout>`, `<Figure>`, `<Diagram>` as "the minimal proven set" of the whitelist — only `<Playground>` gets its own milestone, per §10's explicit Sandpack-isolation rule. Mermaid doesn't carry that same isolation requirement, so it belongs with its whitelist siblings.
- **Tags (`/tags/[tag]`) is folded into Lesson & Category Routing (M8)**, since §7 specifies both in the same routing table and the tag route reuses the same `generateStaticParams` + content-gateway pattern — splitting it would be a half-session milestone with nothing new to review.
- **"Future-ready improvements" is intentionally excluded from this roadmap.** Per §16/§22, those (quizzes, progress tracking, auth, AI tutor, i18n, community contributions) are evidence-gated Phase 1–4 features. Planning them now would violate principle #3 ("never introduce infrastructure early"). They get their own roadmap when their trigger evidence (traffic, lesson count, explicit user requests) actually appears.
- **Deployment Pipeline is positioned immediately after Bootstrap (M2), not with the other operational milestones.** Reviewer change: preview deployments must exist before any feature work begins, so every milestone from M1 onward follows the same Implement → Push → Preview → Review → Merge loop. The milestone was also intentionally narrowed to infrastructure-only responsibilities, with build gates and content validation remaining in their respective later milestones (M3 and M6).
- **Architecture Decision Records and the AI Workflow Contract are merged into one milestone (M14 — Project Governance).** Reviewer change: both are documentation-only artifacts with the same lifecycle and review mode (read-through, not functional testing), so keeping them in one reviewable PR avoids two milestones with near-identical Definition of Done and Review Checklist sections. No content was removed — both original milestones' fields are consolidated in full.

Result: **16 milestones** (after merging Architecture Decision Records and the AI Workflow Contract into one Project Governance milestone, and moving Deployment Pipeline immediately after Bootstrap), Phase 0 of the two-year plan, ending with 3 real published lessons proving the entire loop end-to-end.

---

## M1 — Repository Bootstrap & Toolchain

**Goal:** A Next.js 15 (App Router) + TypeScript-strict project that builds, runs, and deploys, with the full folder skeleton in place.

**Why this milestone exists:** Everything else depends on a working build target. This also establishes the physical folder boundaries (`content/` outside `src/`, `docs/architecture/`, `.ai/prompts/`, `scripts/`) from day one, per §5 — retrofitting folder structure later risks import-path churn.

**Files to create:** `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `.gitignore`, `README.md`, empty-but-committed directories via `.gitkeep`: `content/lessons/`, `docs/architecture/`, `.ai/prompts/`, `scripts/`, `public/`.

**Files to modify:** N/A (greenfield).

**Dependencies required:** `next`, `react`, `react-dom`, `typescript`, `@types/node`, `@types/react`, `@types/react-dom`.

**Acceptance Criteria:**
- `pnpm install && pnpm build` succeeds with zero errors.
- `pnpm dev` serves a minimal home page.
- `tsconfig.json` has `"strict": true`.
- Folder skeleton matches §5 exactly.

**Definition of Done:** Clean `pnpm build`, home page renders in browser, repo pushed with initial commit, folder structure matches the doc.

**Mandatory Validation:**
- `pnpm build`
- `pnpm lint` *(script introduced in M3 — not yet available at this milestone; treat as N/A until then)*
- `pnpm typecheck` *(script introduced in M3 — not yet available at this milestone; treat as N/A until then)*

**Expected Result:** A boring, empty-but-correct Next.js app deployable as-is.

**Estimated Complexity:** Low.
**Estimated Claude Code sessions:** 1.

**Potential Risks:** Next.js 15 App Router defaults shifting between minor versions (turbopack-by-default, etc.) — pin exact versions rather than `^`.

**Review Checklist:**
- [ ] No dependencies beyond the stack table in §3.
- [ ] `strict: true` in tsconfig, not loosened anywhere.
- [ ] Folder names match §5 exactly (no `utils/`, `helpers/`, `services/` created speculatively — §5's explicit warning).

---

## M2 — Deployment Pipeline

*(Moved earlier per reviewer feedback — originally the 12th milestone. Scope narrowed per reviewer feedback to pure infrastructure setup: no dependency on build gates or content validation introduced in later milestones.)*

**Goal:** GitHub repository connected to Vercel, with automatic production deployment on push to `main`, automatic preview deployments on every PR, and a documented rollback procedure.

**Why this milestone exists:** §13 — this is where "push to deploy" becomes real, and where preview deploys start serving as the actual human-review mechanism for every milestone from here on. Scoped to infrastructure only so it stays completely independent of tooling and content-validation gates that don't exist yet — `tsc --noEmit`/lint are introduced in M3, and Zod frontmatter validation is introduced in M6. Wiring those gates into the Vercel build happens in those later milestones, not here.

**Files to create:** `docs/architecture/` note or `README.md` section documenting the rollback procedure (one-click redeploy of previous commit) — this is process documentation, not code.

**Files to modify:** None required for this milestone.

**Dependencies required:** None — Vercel account/project connection (an account-level action, not a code dependency; requires the user to connect the repo).

**Acceptance Criteria:**
- GitHub repository is connected to a Vercel project.
- Push to `main` deploys to production automatically.
- Opening a PR produces a working preview URL showing the rendered app (not just a diff).
- Rollback procedure is documented and exercised at least once (redeploy a previous commit via the Vercel dashboard).

**Definition of Done:** One real PR observed going through preview → merge → production deploy, end to end; rollback procedure tested at least once.

**Mandatory Validation:**
- `pnpm build`
- `pnpm lint` *(script introduced in M3 — not yet available at this milestone; treat as N/A until then)*
- `pnpm typecheck` *(script introduced in M3 — not yet available at this milestone; treat as N/A until then)*

**Expected Result:** The publishing loop's deployment infrastructure is fully automated and observed working at least once, independent of any build gates added by later milestones.

**Estimated Complexity:** Low (mostly account configuration, not code).
**Estimated Claude Code sessions:** 1.

**Potential Risks:** None of this is reversible in the "undo a commit" sense — connecting a real Vercel project is an external-system action. **This milestone requires explicit user confirmation before connecting any account/repo integration**, per the standing rule about actions affecting shared/external systems.

**Review Checklist:**
- [ ] No reference to `tsc --noEmit`, lint, or Zod validation in this milestone's scope — those gates are wired into the build in M3 and M6 respectively, not here.
- [ ] No environment variables or secrets introduced (§13 — there should be none).
- [ ] Rollback procedure documented and tested at least once.

---

## M3 — Development Tooling & Build Gates

**Goal:** ESLint, Prettier, and the two CI gates (`tsc --noEmit`, build) wired as npm scripts.

**Why this milestone exists:** §13 specifies CI is the build itself plus two cheap gates. Codifying them as scripts now means every later milestone is checked the same way, and a future CI config (GitHub Actions or Vercel) has nothing to invent.

**Files to create:** `.eslintrc.json` (or flat config), `.prettierrc`, `.editorconfig`.

**Files to modify:** `package.json` (add `lint`, `typecheck`, `format` scripts).

**Dependencies required:** `eslint`, `eslint-config-next`, `prettier`.

**Acceptance Criteria:**
- `pnpm lint`, `pnpm typecheck`, `pnpm format` all run cleanly against the M1 codebase.
- No dependency beyond lint/format tooling — no husky, no lint-staged (not in §3, and a solo dev with `< 30 min` publish budget doesn't need pre-commit hooks per §17's friction principle).

**Definition of Done:** All three scripts pass on a clean checkout; `pnpm build` still succeeds.

**Mandatory Validation:**
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`

**Expected Result:** Same working app as M1, now with enforceable code quality gates.

**Estimated Complexity:** Low.
**Estimated Claude Code sessions:** 1.

**Potential Risks:** Over-configuring ESLint rules that fight Tailwind/shadcn conventions later (e.g., class-name sorting rules) — keep the ruleset to `eslint-config-next` defaults plus strict TS, nothing custom yet.

**Review Checklist:**
- [ ] No husky/lint-staged/commitlint added (not sanctioned by §3, adds maintenance §2 principle #7 doesn't justify).
- [ ] Scripts match names a future GitHub Action / Vercel build would call directly.

---

## M4 — Design System Foundation

**Goal:** Tailwind CSS + shadcn/ui installed and configured; typography plugin tuned; dark mode wired via `next-themes`; fonts self-hosted.

**Why this milestone exists:** §11 — "don't build a design system, adopt one." This is the one-time customization budget (accent color, font pairing, `prose` tuning) that every later visual milestone builds on.

**Files to create:** `tailwind.config.ts`, `components.json` (shadcn config), `src/components/ui/` (shadcn primitives: button, card, sheet, tabs, dialog — the minimum set needed by layout/mdx components later), `src/components/theme-toggle.tsx`, `src/styles/` (token/CSS-variable definitions).

**Files to modify:** `src/app/globals.css` (Tailwind directives + CSS variables), `src/app/layout.tsx` (font loading via `next/font`, `ThemeProvider`).

**Dependencies required:** `tailwindcss`, `@tailwindcss/typography`, `next-themes`, shadcn CLI-generated Radix packages for the primitives actually used (not the whole library).

**Acceptance Criteria:**
- Dark/light toggle works and persists (via `next-themes` class strategy).
- `prose` typography renders tuned line length (~70ch), visible on the home page with placeholder long-form text.
- Only the accent color / font pairing / spacing defaults are customized — no bespoke design tokens beyond that (§11's explicit "stop there").

**Definition of Done:** Toggle works in browser, `pnpm build` passes, Lighthouse shows no CLS from font loading.

**Mandatory Validation:**
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`

**Expected Result:** A themed, dark-mode-capable shell with shadcn primitives available for later component work.

**Estimated Complexity:** Medium.
**Estimated Claude Code sessions:** 1.

**Potential Risks:** Pulling in the full shadcn component set instead of only what's needed — resist; add primitives on demand in later milestones, not preemptively.

**Review Checklist:**
- [ ] Only 4–5 shadcn primitives added (button, card, sheet, tabs, dialog), not the full catalog.
- [ ] Fonts self-hosted via `next/font`, not a Google Fonts `<link>`.
- [ ] No custom CSS architecture introduced alongside Tailwind (no CSS Modules, no styled-components).

---

## M5 — Application Shell (Layout Chrome)

**Goal:** Header, footer, and page container components — generic app chrome with no real content data yet (no sidebar nav, since no content exists to populate it).

**Why this milestone exists:** §10's three-layer component architecture (`layout/` → `mdx/` → `ui/`) needs its outermost layer in place before lesson rendering exists. Building it now, decoupled from content, keeps this milestone genuinely independent of M6–M8.

**Files to create:** `src/components/layout/header.tsx`, `src/components/layout/footer.tsx`, `src/components/layout/container.tsx`.

**Files to modify:** `src/app/layout.tsx` (compose header/footer around children).

**Dependencies required:** None beyond M4.

**Acceptance Criteria:**
- Header shows site name + theme toggle; footer shows basic links (GitHub repo, license).
- Layout is responsive (mobile-first, single-column) per §11.
- Server Components by default — only the theme toggle is a client component (§10).

**Definition of Done:** Every page renders inside consistent chrome; `pnpm build` passes; verified at mobile and desktop widths.

**Mandatory Validation:**
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`

**Expected Result:** A visually complete but content-empty site shell.

**Estimated Complexity:** Low.
**Estimated Claude Code sessions:** 1.

**Potential Risks:** Temptation to stub in a fake sidebar "for now" — don't; an empty nav with placeholder links violates the "no placeholder implementation" rule. Leave sidebar absent until M9 has real data.

**Review Checklist:**
- [ ] No client components except the theme toggle.
- [ ] No hardcoded/placeholder navigation links.

---

## M6 — Content Contract & Gateway

**Goal:** The Zod-validated frontmatter schema (`schemaVersion`, `status`, taxonomy fields) and the single content-reading module (`lib/content.ts`), proven against real (not placeholder) sample lesson fixtures.

**Why this milestone exists:** This is the architectural load-bearing wall — §1's prime invariant ("a lesson is one folder, one MDX file, validated frontmatter") and §5's "one content gateway" rule. Every later milestone (routing, sidebar, search, SEO) reads through this module; getting it right now prevents the "content gateway leakage" failure mode where later code reads the filesystem directly.

**Files to create:** `src/lib/schema.ts` (Zod schema + types), `src/lib/content.ts` (the only module that touches `content/`), `content/lessons/javascript/closures/index.mdx` + `assets/` (one real, complete sample lesson — not a stub, an actual finished lesson used as the schema/gateway proving ground), a small unit test for the related-lesson fallback logic (§21 explicitly calls this out as worth testing).

**Files to modify:** None outside new files.

**Dependencies required:** `zod`, a minimal test runner for the one tested unit (`vitest`, since §21 says "thin tests for code" — only for genuinely tricky logic).

**Acceptance Criteria:**
- Malformed frontmatter fails `pnpm build` loudly (verified by intentionally breaking a fixture and confirming the build fails, then fixing it).
- `status: draft` lessons are excluded from any production listing logic in `content.ts` (even though no pages consume it yet — the filter function itself is testable now).
- Related-lesson fallback (same category + shared tags) has a passing unit test.

**Definition of Done:** `pnpm build` and `pnpm test` both pass; one real lesson exists and validates; the fallback logic test passes.

**Mandatory Validation:**
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`

**Expected Result:** A provably correct content pipeline with no consumer yet — the foundation, not the feature.

**Estimated Complexity:** Medium-High (this is the highest-leverage milestone in the roadmap).
**Estimated Claude Code sessions:** 1–2.

**Potential Risks:** Over-strict Zod schema blocking legitimately incomplete `draft` lessons (violates the prime invariant in §1/§6). Test this explicitly: a lesson missing every optional section heading must still pass validation as `draft`.

**Review Checklist:**
- [ ] `lib/content.ts` is the *only* file importing `fs`/`content/` — grep to confirm.
- [ ] Schema treats non-frontmatter body structure as pure convention, not validated (§6 explicit rule).
- [ ] `schemaVersion: 1` present on the fixture lesson.
- [ ] Draft-exclusion filter is a pure function, unit-tested independent of file I/O.

---

## M7 — MDX Rendering Pipeline & Component Whitelist

**Goal:** Build-time MDX compilation with the minimal plugin set (`remark-gfm`, `rehype-slug` + autolink, `rehype-pretty-code`/Shiki dual-theme), and the base component whitelist: `<Callout>`, `<Figure>`, `<Diagram>` (Mermaid, rendered to static SVG at build time).

**Why this milestone exists:** §8 — MDX must never compile in-browser or fetch at runtime. This is also where the "component whitelist as explicit API surface" invariant becomes real code, which is what makes AI-generated lessons safe (§8, §19).

**Files to create:** `src/components/mdx/callout.tsx`, `src/components/mdx/figure.tsx`, `src/components/mdx/diagram.tsx`, `src/components/mdx/index.ts` (the whitelist mapping object), MDX pipeline config (wherever `@next/mdx`/content-layer config lives).

**Files to modify:** `next.config.ts` (MDX plugin wiring), the M6 sample lesson (expand it to actually use all three whitelist components, proving they render correctly in real content).

**Dependencies required:** `@next/mdx` or equivalent, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, `rehype-pretty-code`, `shiki`, a Mermaid-to-static-SVG solution (build-time, not client-side — per §14's explicit warning against client-side Mermaid).

**Acceptance Criteria:**
- Code blocks render via Shiki with dual light/dark themes, zero client JS.
- Mermaid diagrams render as static SVG at build time.
- Every whitelist component degrades gracefully if its (minimal) client JS is absent — verified by disabling JS in the browser and confirming sensible fallback rendering (§8's explicit rule).
- Any MDX tag not on the whitelist causes a build-time error, not a silent failure.

**Definition of Done:** Sample lesson renders with headings, code blocks, a callout, a figure, and a diagram, all correct in both themes.

**Mandatory Validation:**
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`

**Expected Result:** One real lesson, fully rendered, viewable at a temporary route or via a test harness page (real routing comes in M8).

**Estimated Complexity:** High (most plugin-integration risk in the roadmap).
**Estimated Claude Code sessions:** 2.

**Potential Risks:** Version incompatibility between `rehype-pretty-code`, Shiki, and Next.js 15's MDX/RSC compiler — this is the single most likely place for build tooling to fight itself. Pin exact versions and verify against Next 15 specifically before adding more plugins.

**Review Checklist:**
- [ ] No plugin added beyond the minimal proven set in §8.
- [ ] Whitelist is a closed set enforced at compile time, not just documentation.
- [ ] Client JS per component is at the leaf only (§10) — verify each whitelist component's `"use client"` boundary is as small as possible.
- [ ] Mermaid renders at build time, not in the browser.

---

## M8 — Lesson & Category Routing (+ Tags)

**Goal:** `/`, `/[category]`, `/[category]/[slug]`, and `/tags/[tag]` routes, all statically generated via `generateStaticParams`, with per-lesson metadata (title/description/canonical/OG/Twitter) and a heading-derived table of contents.

**Why this milestone exists:** §7 — "the URL is the file path." This is where the content gateway (M6) and MDX pipeline (M7) become an actual browsable site.

**Files to create:** `src/app/[category]/page.tsx`, `src/app/[category]/[slug]/page.tsx`, `src/app/tags/[tag]/page.tsx`, `src/app/[category]/[slug]/table-of-contents.tsx` (or similar), `src/app/sitemap.ts`-adjacent metadata helpers (full sitemap comes in M12, but per-page `generateMetadata` starts here).

**Files to modify:** `src/app/page.tsx` (landing/category map, replacing M5's empty home page).

**Dependencies required:** None beyond M6/M7.

**Acceptance Criteria:**
- All lesson URLs generated match `content/lessons/<category>/<slug>` exactly.
- Only `status: published` lessons are reachable via `generateStaticParams` in a production build; `draft`/`review` are excluded (verified by building with a `draft` fixture present and confirming no route exists for it).
- Table of contents matches the heading tree of the M7 sample lesson.
- Category index lists lessons ordered by `order` field.

**Definition of Done:** Full click-through from home → category → lesson works in a production build (`next build && next start`), not just dev mode.

**Mandatory Validation:**
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`

**Expected Result:** A real, navigable (if nav-less) static site with one published lesson live.

**Estimated Complexity:** Medium.
**Estimated Claude Code sessions:** 1–2.

**Potential Risks:** `status` filtering logic accidentally applied inconsistently between `generateStaticParams`, the sitemap (M12), and category listing — centralize the filter in `lib/content.ts` (M6) and have every consumer call the same function, never reimplement the check.

**Review Checklist:**
- [ ] Draft/review lessons produce zero production routes.
- [ ] URL depth never exceeds two segments (§7's explicit ceiling).
- [ ] `generateMetadata` present on every route, not just the lesson page.

---

## M9 — Navigation & Sidebar

**Goal:** Category-driven sidebar (desktop) collapsing to a drawer (mobile, shadcn `Sheet`), populated from the content gateway, plus active-route highlighting.

**Why this milestone exists:** Per §5, sidebar lives in `components/layout/`, but it's meaningless without real category/order data from M6–M8. This is the last piece that makes the app shell (M5) feel like a real product.

**Files to create:** `src/components/layout/sidebar.tsx`, `src/components/layout/mobile-nav.tsx` (Sheet-based drawer).

**Files to modify:** `src/app/layout.tsx` or a nested layout (compose sidebar into the shell), `src/components/layout/header.tsx` (mobile menu trigger).

**Dependencies required:** shadcn `Sheet` (already scaffolded pattern from M4, add the primitive if not already present).

**Acceptance Criteria:**
- Sidebar lists all categories with published lessons, ordered lessons within each category by `order`.
- Active lesson/category is visually highlighted.
- Mobile: sidebar collapses into a drawer triggered from the header.

**Definition of Done:** Navigating via sidebar reaches every published lesson; mobile drawer opens/closes correctly; `pnpm build` passes.

**Mandatory Validation:**
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`

**Expected Result:** A fully navigable site — this is the first milestone that "looks done" to an outside visitor.

**Estimated Complexity:** Medium.
**Estimated Claude Code sessions:** 1.

**Potential Risks:** Lessons with colliding or missing `order` values producing unstable/nondeterministic sidebar ordering — add a deterministic tiebreaker (e.g., fall back to slug alphabetical) in `lib/content.ts`, not in the sidebar component.

**Review Checklist:**
- [ ] Sidebar reads only through `lib/content.ts` (no direct `content/` access).
- [ ] Draft/review lessons never appear in the sidebar.
- [ ] Mobile drawer uses shadcn `Sheet`, not a custom implementation (§11).

---

## M10 — Search (Pagefind)

**Goal:** Post-build Pagefind indexing wired into the build pipeline, with a `/search` client-island UI filtered by category/tag data attributes.

**Why this milestone exists:** §9 — build-time search with zero services. This is explicitly gated to "Phase 1, ~day 1" in §22, meaning it belongs right after the site has real, crawlable published content (M8/M9), not before.

**Files to create:** `src/app/search/page.tsx`, `src/components/search/search-box.tsx` (client component), a `postbuild` script invoking the Pagefind CLI against the `.next`/export output.

**Files to modify:** `package.json` (`build` script chains Pagefind indexing after `next build`), lesson page templates (add `data-pagefind-filter` attributes for category/tags per §9).

**Dependencies required:** `pagefind`.

**Acceptance Criteria:**
- `pnpm build` produces a Pagefind index as part of the same command a Vercel deploy would run.
- Searching from `/search` returns the sample published lesson with a highlighted excerpt.
- Filtering by category/tag works via the exposed data attributes.

**Definition of Done:** Search works against `next build && next start` output (not just dev mode — Pagefind indexes built HTML, so dev-mode testing alone would be misleading).

**Mandatory Validation:**
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`

**Expected Result:** A working search experience with zero external services.

**Estimated Complexity:** Medium.
**Estimated Claude Code sessions:** 1.

**Potential Risks:** Pagefind's post-build step not running (or running against the wrong output directory) in Vercel's actual build environment, silently shipping a working local index but a missing production one — verify against an actual Vercel preview deploy, not just local `next start`.

**Review Checklist:**
- [ ] Pagefind runs as a chained script in `package.json`, not a manual local-only step.
- [ ] Search UI is a client island; no MDX/content compiled in-browser.
- [ ] Verified against a real preview deployment, not just local build output.

---

## M11 — Sandpack Playgrounds

**Goal:** `<Playground>` MDX component — the sole file importing Sandpack — lazy-mounted (intersection observer or click-to-run), degrading to a static Shiki code block when absent.

**Why this milestone exists:** §10 explicitly isolates this as its own concern ("if Sandpack dies, one file changes, zero lessons change"), and §14 calls eager Sandpack loading "the single biggest performance decision on the site." Isolating it in its own milestone, after search, matches the doc's own risk framing in §20 ("least boring dependency in the stack").

**Files to create:** `src/components/mdx/playground.tsx`.

**Files to modify:** `src/components/mdx/index.ts` (add `Playground` to the whitelist), sample lesson (mark one snippet as a live playground, per §8's "1–2 snippets per lesson worth making live").

**Dependencies required:** `@codesandbox/sandpack-react`.

**Acceptance Criteria:**
- Sandpack does not load on initial page load (verified via network tab — zero Sandpack JS in the initial bundle).
- Playground mounts only on scroll-into-view or explicit click.
- With JS disabled, the same MDX renders as a plain static code block (graceful degradation, §8).

**Definition of Done:** Lesson page with a playground scores within the §14 JS budget target (<100 KB JS before playground interaction) in a Lighthouse/network check.

**Mandatory Validation:**
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`

**Expected Result:** A working live-code playground on the sample lesson, with measured, bounded performance cost.

**Estimated Complexity:** Medium-High.
**Estimated Claude Code sessions:** 1–2.

**Potential Risks:** Sandpack imported eagerly by accident (e.g., via a barrel file re-export that gets included in a shared chunk) — verify with a bundle analyzer, not just code review, since accidental eager inclusion is easy to miss by reading source alone.

**Review Checklist:**
- [ ] Only `playground.tsx` imports anything from `@codesandbox/sandpack-react` — grep to confirm.
- [ ] Confirmed via bundle analysis (not just code inspection) that Sandpack isn't in the initial JS payload.
- [ ] Static fallback rendering verified with JS disabled.

---

## M12 — SEO & Structured Data

**Goal:** `sitemap.xml`, RSS feed, JSON-LD (`Article`/`TechArticle` + `BreadcrumbList`), and auto-generated OG images — all derived from the content gateway.

**Why this milestone exists:** §15 — structural SEO is a one-time investment that pays for the life of the project, and it depends on having real routed, published content (M8) to generate from.

**Files to create:** `src/app/sitemap.ts`, `src/app/rss.xml/route.ts` (or equivalent RSS route), `src/lib/json-ld.ts`, `src/app/[category]/[slug]/opengraph-image.tsx` (Vercel OG).

**Files to modify:** Lesson page (`src/app/[category]/[slug]/page.tsx`) to inject JSON-LD via `generateMetadata`/script tag.

**Dependencies required:** None beyond Next.js built-in OG image generation (`next/og`, already bundled).

**Acceptance Criteria:**
- `sitemap.xml` and RSS both list exactly the published lessons, matching M8's routing filter.
- JSON-LD validates against Google's Rich Results structured-data test.
- OG images generate per-lesson from title/category with no per-lesson manual work.

**Definition of Done:** All four artifacts verified against a production build; JSON-LD passes validation.

**Mandatory Validation:**
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`

**Expected Result:** A search-engine-ready site with zero recurring per-lesson SEO work.

**Estimated Complexity:** Medium.
**Estimated Claude Code sessions:** 1.

**Potential Risks:** OG image generation (a Vercel-specific edge function under the hood) quietly becoming load-bearing for core rendering rather than staying an optional, deletable enhancement — this would undermine the §13 escape hatch to Cloudflare Pages. Keep OG generation strictly additive: the lesson page must render correctly with the OG route deleted.

**Review Checklist:**
- [ ] Sitemap/RSS reuse the exact same published-lesson filter as M8 routing (no reimplementation).
- [ ] JSON-LD passes Google's structured-data validator.
- [ ] OG image generation is deletable without breaking lesson rendering (§13's escape-hatch requirement).

---

## M13 — Lesson Scaffold Script

**Goal:** `scripts/new-lesson.ts` — generates a correctly-structured lesson folder (frontmatter + section-heading template + `assets/`) in under a second.

**Why this milestone exists:** §17 — "the scaffold script is the template's source of truth." This can only be built now because it must encode the exact schema (M6) and section conventions (§6) already implemented, or it would drift from day one.

**Files to create:** `scripts/new-lesson.ts`.

**Files to modify:** `package.json` (add `new-lesson` script/bin entry).

**Dependencies required:** None beyond Node's built-in `fs`/argument parsing (or a tiny CLI-arg-parsing dependency only if genuinely needed — prefer none).

**Acceptance Criteria:**
- `pnpm new-lesson <category> <slug>` creates a folder matching `content/lessons/<category>/<slug>/index.mdx` + `assets/`, with valid `schemaVersion: 1`, `status: draft` frontmatter and the full section-heading template from §6.
- Output passes Zod validation (M6) immediately with no manual fixes.

**Definition of Done:** Running the script end-to-end produces a lesson that builds successfully as a `draft`.

**Mandatory Validation:**
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`

**Expected Result:** A one-command lesson generator — the literal first step of the publishing loop in §17.

**Estimated Complexity:** Low.
**Estimated Claude Code sessions:** 1.

**Potential Risks:** Template drifting out of sync with the Zod schema over time (two sources of truth) — mitigate by having the script import types from `lib/schema.ts` rather than duplicating field definitions.

**Review Checklist:**
- [ ] Script imports schema types/defaults from `lib/schema.ts`, doesn't redefine them.
- [ ] Generated lesson defaults to `status: draft` (§6 — only humans/AI-with-review promote further).
- [ ] Runs in under a second (§5's explicit target).

---

## M14 — Project Governance

*(Merged per reviewer feedback — originally two separate milestones, "Architecture Decision Records" and "AI Workflow Contract." No content was removed; both milestones' fields are consolidated below into one reviewable PR.)*

**Goal:** Produce the three founding ADRs (`docs/architecture/ADR-001-content-contract.md`, `ADR-002-routing.md`, `ADR-003-search.md` — the one-hour extraction from this document that §22 calls for), plus `CLAUDE.md` (the AI Contribution Contract from §19) and the five-file prompt library in `.ai/prompts/` (`lesson.md`, `implementation.md`, `review.md`, `quiz.md`, `diagram.md`).

**Why this milestone exists:** §18 — ADRs are the artifacts that let future-you (or an AI) understand *why* the content contract, routing, and search decisions were made, without re-deriving them from a 20-section document each time. §19 — `CLAUDE.md` and the prompt library convert the architectural judgment already encoded in this document into machine-readable policy that persists across sessions with no memory. Both are placed after the pipeline is fully built (M1–M13) so they can reference the *actual* component whitelist, schema, and scaffold script rather than a forward-looking guess. ADRs and the AI workflow contract are consolidated into a single milestone because both are documentation-only artifacts sharing the same lifecycle and review mode (read-through, not functional testing) — splitting them produced two milestones with near-identical Definition of Done and Review Checklist sections.

**Files to create:**
- `docs/architecture/ADR-001-content-contract.md`, `ADR-002-routing.md`, `ADR-003-search.md` (format: Context, Decision, Alternatives considered, Consequences — half a page each, per §18)
- `CLAUDE.md`
- `.ai/prompts/lesson.md`, `.ai/prompts/implementation.md`, `.ai/prompts/review.md`, `.ai/prompts/quiz.md`, `.ai/prompts/diagram.md`

**Files to modify:** None.

**Dependencies required:** None.

**Acceptance Criteria:**
- Each ADR is genuinely under ~20 minutes of reading, covers the specific decision (not a restatement of the whole architecture doc), and follows the four-section format exactly.
- `CLAUDE.md` contains the exact "never without approval" / "always" rules from §19, verbatim in spirit.
- `lesson.md` embeds the real component whitelist (M7/M11) and section template (M13's scaffold), not a placeholder list.
- `implementation.md` references `CLAUDE.md` rather than duplicating it.

**Definition of Done:** Three ADRs committed, each reviewed for correctness against the corresponding section of this architecture document (§6, §7, §9); all six AI-workflow files committed, cross-checked that the component whitelist and schema fields named in the prompts match the actual code in `lib/schema.ts` and `components/mdx/index.ts`.

**Mandatory Validation:**
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`

**Expected Result:** A minimal, permanent decision record separate from the (larger, more discursive) architecture document, plus an AI contract and prompt library that every future AI session (this one included) inherits automatically.

**Estimated Complexity:** Low-Medium (low technical complexity per artifact; combined volume across eight files is the only added weight).
**Estimated Claude Code sessions:** 1–2.

**Potential Risks:**
- ADRs becoming a second, competing source of truth if they restate rather than reference this document — keep them short and pointed, per §18's explicit warning against "paperwork tax."
- Prompt library silently drifting from the real schema/whitelist as the project evolves — treat "update `.ai/prompts/` in the same commit" as a standing rule for all future milestones that touch schema or whitelist (this should also be stated inside `CLAUDE.md` itself, per §19).

**Review Checklist:**
- [ ] Each ADR fits the four-section format, no more.
- [ ] None exceeds roughly half a page.
- [ ] Marked "immutable once accepted" per §18 (a comment/header noting this, not a technical enforcement).
- [ ] `CLAUDE.md`'s rules match §19 exactly (dependency/schema/routing/folder-rename restrictions).
- [ ] Prompt library's component whitelist matches the real code, not a copy that can drift.
- [ ] `quiz.md` and `diagram.md` exist even though `<Quiz>` itself is a future (Phase 2) feature — the prompt can be written now since it costs nothing and doesn't require the component to exist yet (writing the prompt isn't "building the feature").

---

## M15 — Developer Experience & Maintenance Jobs

**Goal:** A scheduled (non-blocking) weekly link checker, and documented policies for quarterly dependency updates and manual Lighthouse checks.

**Why this milestone exists:** §13 and §17 both specify these as *deliberately* not merge-blockers — a dead external link or a routine dependency bump must never stop a lesson from shipping. This is the last piece of the "protect the publishing loop" principle before real content flows.

**Files to create:** A scheduled CI job (e.g., GitHub Actions workflow) running a link checker weekly, `docs/` note on the quarterly dependency update cadence and manual Lighthouse-check trigger conditions (§14 point 5).

**Files to modify:** None in `src/` or `content/`.

**Dependencies required:** A link-checking tool (dev dependency only, not part of the app bundle).

**Acceptance Criteria:**
- Link checker runs on a schedule, not on every PR/merge.
- A broken external link produces a visible report (issue/notification) but does not fail any build.
- Dependency update cadence documented as quarterly/batched (§17 — explicitly not Dependabot-driven noise).

**Definition of Done:** One observed scheduled run of the link checker completing without blocking any deploy.

**Mandatory Validation:**
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`

**Expected Result:** Maintenance happens on a calm cadence, never interrupting the study/publish loop.

**Estimated Complexity:** Low.
**Estimated Claude Code sessions:** 1.

**Potential Risks:** Accidentally wiring the link checker as a merge/build gate instead of a scheduled job — this directly contradicts §13's explicit instruction and must be caught in review.

**Review Checklist:**
- [ ] Link checker is scheduled, confirmed not attached to PR/merge triggers.
- [ ] No Dependabot or auto-merge dependency automation introduced.
- [ ] Lighthouse check documented as manual/triggered-by-layout-change, not automated CI (§14 explicitly calls automated Lighthouse CI "overkill").

---

## M16 — Launch Content: First 3 Published Lessons

**Goal:** Run the actual publishing loop (§17) end-to-end three times, producing three real, `published`, human-reviewed lessons live in production — the Phase 0 exit criterion from §22.

**Why this milestone exists:** This is the milestone that proves the other fifteen actually work together as a system, not just individually. §22 is explicit: "Ship with 3 real lessons." Nothing before this milestone is validated as a *pipeline* until content flows through it for real.

**Files to create:** Three real `content/lessons/<category>/<slug>/index.mdx` files (using M13's scaffold, M14's `lesson.md` prompt, going through `draft → review → published`), with any accompanying `assets/`.

**Files to modify:** None in `src/`.

**Dependencies required:** None.

**Acceptance Criteria:**
- Each lesson goes through the full lifecycle: scaffolded → drafted (AI-assisted) → `review` → PR → preview deploy read by the human → `published` → merged.
- Total platform-overhead time per lesson (everything except the actual studying/writing) is measured and is under the §17 target (~5 min of the 30 min budget).
- All three lessons appear correctly in sidebar, search, sitemap, and RSS.

**Definition of Done:** Three lessons live in production, each independently verified against the full feature set built in M1–M15 (rendering, playground where used, search indexing, SEO metadata).

**Mandatory Validation:**
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`

**Expected Result:** A live, real, publicly usable interview-prep site with three genuinely useful lessons — Phase 0 complete.

**Estimated Complexity:** Low (content work), but this is the true integration test of the whole roadmap.
**Estimated Claude Code sessions:** 1 (plus the human's own study/writing time, which is explicitly outside "platform" scope).

**Potential Risks:** Discovering integration gaps between milestones only now (e.g., a whitelist component that works in the M7 sample lesson but not in a real one with different heading structure) — treat any friction discovered here as a same-week fix per §20 risk #1 ("any recurring friction gets fixed within a week or the step gets deleted").

**Review Checklist:**
- [ ] All three lessons are `status: published` only via a human-authored merge commit (§6's explicit rule — AI may propose `review`, never `published`).
- [ ] Measured publish-overhead time recorded somewhere (even just in the PR description) to validate the §17 target.
- [ ] No milestone-specific workaround or manual step was needed that isn't already captured in the scaffold/prompt library (if one was, that's a same-week follow-up fix, per §20).

---

# Top 10 Implementation Risks

**1. Content living outside `/src` breaks Next.js's static asset assumptions.**
*Why it exists:* `next/image` and static imports assume assets under `public/` or importable from `src/`; §5 deliberately co-locates lesson images under `content/lessons/.../assets/`, outside both.
*How to avoid:* Decide and document (in ADR-001) exactly how co-located images reach the browser — likely a build-time copy step or a custom loader — before M7 needs to render a `<Figure>` with a real image.
*How to detect early:* Try rendering one lesson with a real co-located image in M7; if `next/image` can't resolve the path, this surfaces immediately rather than silently at lesson #50.

**2. MDX/Next.js 15 plugin version incompatibility.**
*Why it exists:* `rehype-pretty-code`, Shiki, and the App Router's RSC-aware MDX compiler are independently versioned and don't always test against each other's latest releases.
*How to avoid:* Pin exact versions in M7, verify against Next 15 specifically before adding any further plugin.
*How to detect early:* M7's acceptance criteria require dual-theme code blocks rendering correctly in an actual production build (`next build && next start`), not just dev mode, which catches most RSC-boundary issues.

**3. Zod schema strictness silently blocking `draft` lessons.**
*Why it exists:* It's tempting to make required fields "required" for consistency, but §6 mandates that a lesson missing sections must still build as `draft`.
*How to avoid:* Test the schema against a deliberately minimal fixture (frontmatter only, no body sections) in M6, before any other schema evolution happens.
*How to detect early:* M6's acceptance criteria explicitly include this test; if skipped, it resurfaces as "can't commit half-finished lesson" — the exact failure §20 risk #1 warns about.

**4. Content gateway leakage.**
*Why it exists:* It's easy, under time pressure, for a later page (sidebar, search, SEO) to read `content/` directly instead of through `lib/content.ts`, especially across different Claude Code sessions with no memory of the rule.
*How to avoid:* State the rule in `CLAUDE.md` (M14) explicitly, and grep for direct `fs`/`content/` imports outside `lib/content.ts` as a standing review-checklist item on every milestone from M8 onward.
*How to detect early:* A simple `grep -r "content/lessons" src/ --include="*.tsx"` outside `lib/` should return nothing, ever — cheap to run every PR.

**5. Pagefind's post-build step not actually running in the Vercel build.**
*Why it exists:* Pagefind indexes *built HTML*; if the `build` script in `package.json` doesn't chain the indexing step in the exact order Vercel invokes it, search can work locally and silently fail in production.
*How to avoid:* M10's Definition of Done explicitly requires verifying against a real Vercel preview deploy, not just `next start` locally.
*How to detect early:* Search a term from the sample lesson directly on the first preview URL after M10 merges — a 5-second manual check that catches this immediately.

**6. Sandpack loaded eagerly despite the isolation design.**
*Why it exists:* A single careless import (e.g., re-exporting `Playground` through a shared barrel file that also gets imported eagerly elsewhere) can pull Sandpack into the main bundle without any obviously wrong-looking code.
*How to avoid:* M11 requires bundle analysis, not just code review, to confirm.
*How to detect early:* Run `next build` with a bundle analyzer once after M11 and check the first-load JS size against the §14 target (<100 KB before playground interaction) — a regression here is immediately visible as a number, not a code smell.

**7. TypeScript strict mode friction with MDX component props.**
*Why it exists:* MDX-to-component prop passing is loosely typed by default; strict mode (M1) will surface this the moment the whitelist (M7) has more than trivial props (e.g., `<Callout type="warning">`).
*How to avoid:* Type each whitelist component's props explicitly and export the prop types from `components/mdx/index.ts` so the lesson-authoring prompt (M14) can describe exact valid values.
*How to detect early:* `pnpm typecheck` (M3's gate) should fail loudly on any prop mismatch — but only if the whitelist components are properly typed rather than accepting `any`/`ComponentProps<'div'>` as an escape hatch. Watch for that escape hatch specifically in review.

**8. Three-way drift between schema, scaffold script, and AI prompt library.**
*Why it exists:* `lib/schema.ts` (M6), `scripts/new-lesson.ts` (M13), and `.ai/prompts/lesson.md` (M14) all encode the same frontmatter contract independently; each is built in a different milestone/session.
*How to avoid:* M13 and M14 both explicitly require importing/referencing M6's schema rather than duplicating field lists.
*How to detect early:* After M14, run the scaffold script and confirm its output frontmatter exactly matches what `lesson.md`'s prompt tells an AI to produce — a 2-minute manual cross-check that catches drift before it compounds across dozens of AI-generated lessons.

**9. Non-deterministic sidebar/category ordering.**
*Why it exists:* §6's `order` field is per-category and manually assigned; two lessons can easily collide (both `order: 3`) or a new lesson can be scaffolded without setting it.
*How to avoid:* M9's sidebar sort must have an explicit, deterministic tiebreaker (e.g., alphabetical slug) rather than relying on file-system iteration order, which isn't guaranteed stable.
*How to detect early:* Add two fixture lessons with identical `order` values during M9's testing and confirm the sidebar renders them in a stable, repeatable sequence across rebuilds.

**10. Vercel-only APIs (OG image generation) becoming load-bearing.**
*Why it exists:* `next/og` is easy to reach for and works great, but §13's escape hatch requires the *entire rendering path* to survive a Cloudflare Pages migration; if OG generation gets wired into the main lesson `generateMetadata` in a way that throws when the OG route is removed, the escape hatch is quietly broken.
*How to avoid:* M12's Definition of Done explicitly requires verifying the lesson page still renders correctly with the OG image route deleted.
*How to detect early:* As part of M12's review, temporarily delete `opengraph-image.tsx` and confirm `pnpm build` and the lesson page both still succeed — a 1-minute check that directly tests the escape-hatch invariant from §13.

---

## Milestone Completion Report Template

Claude Code must produce a report in this format immediately after completing each milestone, before stopping for human review:

```
------------------------------------------------
Milestone Completion Report

Milestone:

Completed Work:

Files Created:

Files Modified:

Architecture Rules Followed:

Manual Testing Performed:

Validation Results:
- pnpm build
- pnpm lint
- pnpm typecheck

Known Limitations:

Next Milestone:
------------------------------------------------
```

---

## Status

**16 milestones**, each independently buildable, testable, and reviewable as one PR, ending with three real published lessons proving the full pipeline works.

Awaiting approval before implementation begins. Once approved: one milestone per Claude Code session, starting with M1, stopping after each for review and a Milestone Completion Report — no code, folders, or config until approved.
