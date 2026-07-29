# Diagram Generation Prompt

Use this prompt to generate a Mermaid diagram for a lesson's
`## Visual Explanation` section. This pipeline is already implemented
(`scripts/render-diagrams.mjs`) — this prompt only covers producing the
Mermaid *source*, not the rendering step.

---

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
source and the generated `.svg`. Reference the `.svg` from the lesson with:

```
<Diagram
  src="/lessons/<category>/<slug>/assets/<name>.svg"
  alt="Describes what the diagram shows, for a screen reader."
  caption="Optional caption."
/>
```

Never reference the `.mmd` file directly from a lesson, and never attempt to
render Mermaid client-side — both are explicitly ruled out (architecture doc
§14).
