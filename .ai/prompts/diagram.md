# Diagram Generation Prompt

Use this prompt to generate a visual for a lesson's `## Visual Explanation`
section. `<Diagram>` accepts any static SVG — this prompt covers the two
sanctioned ways to produce one. Pick Mermaid for structure, hand-authored
animated SVG for a sequential/temporal process worth showing as motion.
Both pipelines already exist; this prompt only covers producing source, not
implementing new tooling.

---

## Option A: Mermaid (structural diagrams — the default choice)

Write a Mermaid diagram (flowchart, sequence, or state diagram — whichever
fits the concept) that visualizes: `<describe the mechanism here>`.

Rules:
- Output raw Mermaid syntax only, no explanation, no code fence — it will be
  saved directly as a `.mmd` file.
- Keep it readable at a glance: prefer fewer, clearly-labeled nodes over an
  exhaustive diagram. This accompanies prose that already explains the
  mechanism in words; the diagram's job is to make the *shape* of it
  memorable, not to repeat every detail.
- Use plain node labels (no HTML, no styling directives) — this renders to a
  static SVG via Playwright, and simple syntax renders most reliably.

**After generating the source**, save it to
`content/lessons/<category>/<slug>/assets/<name>.mmd`, then run
`pnpm render-diagrams` locally (not in CI — Mermaid rendering needs a real
browser, which Vercel's build container can't run, per
`scripts/render-diagrams.mjs`'s header comment). Commit both the `.mmd`
source and the generated `.svg`.

## Option B: Hand-authored animated SVG (sequential/temporal processes)

For a mechanism that's fundamentally about *motion over time* (something
traveling between states, a playhead sweeping through phases) rather than
static structure, a Mermaid flowchart flattens the thing that actually
makes it click. Instead, hand-author an SVG with embedded SMIL
(`<animate>`, `<animateMotion>`) or CSS `@keyframes`, saved directly as
`content/lessons/<category>/<slug>/assets/<name>.svg` — no intermediate
source file, no rendering step, since you're writing the SVG itself.

Rules:
- `repeatCount="indefinite"` so it loops without user interaction — there's
  no play button, no client JS driving it, it's a static file that happens
  to animate.
- Keep the color palette consistent with the Mermaid-rendered diagrams
  already in the codebase (`#ECECFF` fill / `#9370DB` stroke for structural
  boxes, `#333` body text) so the two diagram types don't look like they
  came from different products. Semantic colors (e.g. red for a blocked/
  error state, green for ready) are fine layered on top for the parts of
  the diagram those colors are actually explaining.
- The SVG is loaded as an independent document (`<Diagram>` renders it
  through `next/image`), so it cannot read the host page's CSS variables
  or dark/light theme — all colors must be hardcoded to values that read
  acceptably on both light and dark surrounding backgrounds.
- No JavaScript, no external references, no dependency on anything outside
  the single `.svg` file — same zero-client-JS guarantee a static image
  already had, per architecture doc §14.
- See `content/lessons/javascript/event-loop/assets/event-loop-journey.svg`
  and `content/lessons/javascript/hoisting/assets/hoisting-timeline.svg`
  for worked examples (a token traveling between labeled regions, and a
  timeline playhead driving state changes in a few tracked values).

## Referencing either kind from a lesson

```
<Diagram
  src="/lessons/<category>/<slug>/assets/<name>.svg"
  alt="Describes what the diagram shows (and how it animates, if it does), for a screen reader."
  caption="Optional caption."
  width={...}  // match the SVG's actual viewBox aspect ratio
  height={...}
/>
```

Never reference a `.mmd` file directly from a lesson, and never attempt to
render Mermaid client-side — both are explicitly ruled out (architecture doc
§14). An animated SVG is not an exception to "no client-side rendering" --
it's a static file the browser paints, with zero JavaScript involved.
