# Maintenance Policy

Operational cadences that are deliberately **not** build or merge gates
(architecture doc §13, §17): none of the jobs below can ever block a lesson
from shipping. This is a process document, not code — nothing here is
enforced by tooling beyond the schedule/manual triggers described.

## Weekly link check

`.github/workflows/link-check.yml` runs [lychee](https://lychee.cli.rs/)
against `content/**/*.mdx` and the project's own `.md` files every Monday
(plus on-demand via the Actions tab's "Run workflow" button). It never runs
on push or pull request, and it never fails the workflow — a broken external
link only opens a GitHub issue (labeled `report`, `broken-links`) with the
report, for the human to triage on their own schedule.

Because the underlying action creates a new issue on every run that finds a
problem rather than updating one in place, a persistently broken link will
produce a new issue each week until it's fixed — close the older duplicates
once the link is corrected, or fix it promptly enough that this never comes
up in practice.

## Quarterly dependency updates

Dependencies are updated **quarterly, in one batched PR, on a calm day** —
never continuously, never via Dependabot or auto-merge automation. A static
site with no backend and no user input has near-zero security surface, so
there's no safety reason to update faster, and letting update noise interrupt
the study/publish loop is a worse outcome than a slightly stale lockfile.

Process, each quarter:
1. `pnpm outdated` to see what's behind.
2. Update in one pass, not dependency-by-dependency commits.
3. Run the full validation suite (`pnpm build`, `pnpm lint`, `pnpm typecheck`,
   `pnpm test`) and manually click through the site once (home → a lesson →
   search) before merging.
4. If anything requires non-trivial migration work, it's fine to defer that
   one package to the next quarter rather than blocking the batch.

## Manual Lighthouse checks

Per architecture doc §14 point 5: automated Lighthouse CI is overkill for a
static site whose performance regressions come from *components you add*,
not from entropy over time. Run Lighthouse manually (Chrome DevTools'
Lighthouse panel, or `npx lighthouse <url>` against `pnpm build && pnpm start`)
whenever a change touches:

- layout or global CSS (`src/app/layout.tsx`, `globals.css`, Tailwind config),
- font loading (`next/font` usage),
- a new or modified MDX whitelist component (`src/components/mdx/`),
- anything that adds client-side JavaScript to the lesson page's initial load.

Targets to check against (architecture doc §14): LCP < 1.5s on 4G, CLS ≈ 0,
lesson page < 100 KB JS before any `<Playground>` is interacted with.
