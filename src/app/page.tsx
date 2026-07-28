export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <article className="prose dark:prose-invert">
        <h1>Frontend Learning Platform</h1>
        <p>
          This paragraph exists to prove the typography plugin is wired up
          correctly and that the line length is tuned to a comfortable reading
          measure. Once lesson content starts flowing through the content
          gateway in a later milestone, this placeholder copy goes away and real
          MDX takes its place.
        </p>
        <p>
          Until then, this page exercises the design system foundation: Tailwind
          CSS, the shadcn/ui primitives, the accent color, the self-hosted font,
          and the dark mode toggle in the corner of the screen. Toggle it and
          confirm the whole page — background, text, and this prose block —
          repaints correctly and the choice survives a reload.
        </p>
        <h2>What comes next</h2>
        <p>
          Navigation and real content arrive in later milestones. For now, this
          is a themed, dark-mode-capable shell with shadcn primitives available
          for the component work ahead.
        </p>
      </article>
    </main>
  );
}
