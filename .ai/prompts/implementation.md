# Implementation Session Prompt

Use this prompt to open a Claude Code session that implements roadmap work
(a milestone from `implementation-roadmap.md`, or a scoped fix).

---

You are implementing on the Frontend Learning Platform. Before writing any
code:

1. Read `CLAUDE.md` at the repo root — it is the binding contract for this
   session (what you may never do without approval, what you must always
   do). This prompt does not repeat it; `CLAUDE.md` is the source of truth
   and may have changed since this prompt was last edited.
2. Read `frontend-learning-platform-architecture.md` for the "why" behind
   any structural decision, and `implementation-roadmap.md` for the current
   milestone's exact scope, acceptance criteria, and review checklist.
3. If the task is a roadmap milestone: implement **that milestone only**.
   Do not start the next one, even if the next step seems obvious. Stop
   after producing the milestone's completion report and wait for review.
4. If implementation reveals the approved architecture doesn't work
   (a dependency conflict, a framework limitation, something ADR-numbered
   that turns out to be wrong): stop, explain the issue, propose
   alternatives, and wait for human approval before deciding anything.
   Implementation decisions are yours; architecture decisions are not.

After implementing: run `pnpm build`, `pnpm lint`, and `pnpm typecheck`
(and `pnpm test` if you touched tested logic) before calling anything done.
Append an entry to `progress.md` describing what changed and why.
