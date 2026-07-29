# Lesson Generation Prompt

Use this prompt (ChatGPT or any drafting AI) to turn study notes into a
lesson body. It is the executable spec of the content contract — keep it in
sync with `src/lib/schema.ts` and `src/components/mdx/index.ts` whenever
either changes.

---

You are writing one lesson for a frontend interview-prep platform. The
lesson already exists as a scaffolded file (created via
`pnpm new-lesson <category> <slug>`) with valid frontmatter and empty section
headings. Fill in the body only — do not touch the frontmatter block between
the `---` delimiters.

**Sections, in this exact order** (plain `##` Markdown headings, not
components — a lesson may leave a section thin, but never delete or reorder
one):

1. `## Concept` — the idea in plain language, no jargon before it's earned.
2. `## Why` — why this exists / why it matters, not just what it is.
3. `## Internal Working` — the mechanism, at the depth a senior engineer
   would expect in an interview follow-up.
4. `## Visual Explanation` — a `<Figure>` or `<Diagram>` (see whitelist
   below) plus a short caption-level explanation of what it shows.
5. `## Examples` — 2–4 realistic code examples, each with 1–2 sentences of
   framing before or after, not just a dumped code block.
6. `## Interview Questions` — 3–6 questions with full answers, phrased the
   way an interviewer would actually ask them.
7. `## Common Mistakes` — the mistakes people actually make, each with the
   fix, not just "don't do this."
8. `## Summary` — a tight paragraph a reader could use as a spoken answer.
9. `## Related Topics` — a short bullet list of adjacent concepts (plain
   text; only set frontmatter `related[]` if you know the exact
   `category/slug` of an existing lesson).
10. `## Next Lesson` — one or two sentences on the natural next topic.
11. `## Revision Notes` — a bullet-point crib sheet for a fast re-read.
12. `## Exercises` — 2–4 hands-on prompts a reader can attempt themselves.

**MDX component whitelist** — this is a *closed set*; anything else fails
the build (`src/lib/mdx.ts`). Do not invent new components or props.

```
<Callout type="info" | "tip" | "warning" | "danger">
  Short text. Default type is "info".
</Callout>

<Figure
  src="/lessons/<category>/<slug>/assets/<file>.svg"
  alt="Describes the image for a screen reader, not just labels it."
  caption="Optional caption shown under the image."
  width={800}   // optional, defaults to 800
  height={450}  // optional, defaults to 450
/>

<Diagram
  src="/lessons/<category>/<slug>/assets/<file>.svg"
  alt="Describes the diagram for a screen reader."
  caption="Optional caption."
  width={700}   // optional, defaults to 700
  height={500}  // optional, defaults to 500
/>
{/* Diagram renders a pre-rendered Mermaid SVG -- see .ai/prompts/diagram.md
    for how that .svg gets produced. Do not describe Mermaid syntax here. */}

<Playground
  code={`// real, runnable code`}
  template="vanilla" | "react"  // optional, defaults to "vanilla"
/>
```

Rules for using them:
- `<Figure>`/`<Diagram>` `src` paths always point at
  `/lessons/<category>/<slug>/assets/...` — that's where
  `scripts/copy-lesson-assets.mjs` publishes co-located lesson assets.
- Only mark 1–2 code snippets per lesson as `<Playground>` — the ones
  genuinely worth making live. Everything else is a plain fenced code block
  (`` ```js ``), which is free (static Shiki highlighting, zero client JS).
- Never write raw `<div>`/custom JSX beyond the four components above.

**Frontmatter you must never touch or invent fields for** (already
scaffolded, defined in `src/lib/schema.ts`): `schemaVersion`, `title`,
`description`, `category`, `tags[]`, `difficulty`, `order`, `related[]`,
`updatedAt`, `status`. If a detail seems missing from this list, it doesn't
belong in frontmatter — put it in the body instead.

**Status:** leave `status: draft` as scaffolded. You may promote it to
`status: review` once the body is complete, but never to `published` — only
a human does that.
