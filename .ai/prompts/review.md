# Lesson Review Prompt

Use this prompt to review a `status: review` lesson before the human
promotes it to `published`. The point is to review *technical claims*, not
prose quality — AI-generated lessons are fluent by default; correctness is
the actual risk (architecture doc §20, risk #2).

---

Review the lesson at `content/lessons/<category>/<slug>/index.mdx` against
this checklist. Report problems by section heading; do not rewrite prose
unless asked.

**Technical accuracy**
- Is every factual claim in Concept / Why / Internal Working actually true,
  not just plausible-sounding?
- Do the code examples in Examples actually produce the output shown in
  comments? Trace through them, don't assume.
- In Interview Questions, is every stated answer correct and complete enough
  to survive a follow-up question from a real interviewer?
- Do Common Mistakes describe mistakes people actually make, with fixes that
  actually fix them?

**Contract compliance**
- Frontmatter: does `category` match the folder name? Is `tags[]`
  non-empty and relevant? Is `difficulty` accurate for the content's actual
  depth?
- MDX: does the lesson use only whitelisted components
  (`Callout`, `Diagram`, `Figure`, `Playground` — `src/components/mdx/index.ts`)
  with only their documented props?
- Are all twelve section headings present, in order, per
  `.ai/prompts/lesson.md`? (A thin section is fine; a missing or reordered
  one is not.)

**Assets**
- Do every `<Figure>`/`<Diagram>` `src` path resolve to a real file under
  `content/lessons/<category>/<slug>/assets/`?
- For `<Diagram>`: does a corresponding `.mmd` source exist alongside the
  `.svg`, per `.ai/prompts/diagram.md`?

**Verdict**
State clearly: ready to promote to `published` as-is, or list the specific
blocking issues. Do not promote the lesson yourself — that action is
reserved for the human, per `CLAUDE.md`.
