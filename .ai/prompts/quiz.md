# Quiz Generation Prompt

**Status: not yet usable.** The `<Quiz>` MDX component does not exist yet —
it's a Phase 2 feature (architecture doc §16, §22), evidence-gated behind
Phase 1 content velocity. This prompt is written now, ahead of the
component, because writing it costs nothing and the eventual component
should be designed to fit content this prompt already knows how to produce
— not the other way around. Do not add `<Quiz>` to a lesson until it exists
in `src/components/mdx/index.ts`'s whitelist and this header is removed.

---

When `<Quiz>` ships, it will take inline question data (no backend, no
per-user state beyond the existing `localStorage`-based progress layer) and
render it client-side. Expected shape, to keep in sync with the real
component once built:

```
<Quiz
  questions={[
    {
      question: "...",
      choices: ["...", "...", "...", "..."],
      correctIndex: 0,
      explanation: "Why this answer is correct, shown after answering.",
    },
    // 3-6 questions per lesson
  ]}
/>
```

Until the component exists, do not generate this block into any lesson —
use `## Interview Questions` (already part of the standard section
template, see `.ai/prompts/lesson.md`) for question-and-answer content
instead.
