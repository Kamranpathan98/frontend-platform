import { notFound } from "next/navigation";

import { mdxComponents } from "@/components/mdx";
import { getAllLessons } from "@/lib/content";
import { compileLessonBody } from "@/lib/mdx";

// Temporary M7 verification route: proves the MDX pipeline (Shiki,
// whitelist components, build-time compilation) end-to-end against the
// real closures fixture. Real, content-gateway-driven lesson routing
// arrives in M8 and supersedes this route.
export default async function MdxPreviewPage() {
  const lessons = getAllLessons();
  const lesson = lessons.find(
    (l) => l.category === "javascript" && l.slug === "closures",
  );

  if (!lesson) {
    notFound();
  }

  const Content = await compileLessonBody(lesson.body);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-muted-foreground mb-8 text-sm">
        Temporary M7 verification route — real lesson routing arrives in M8.
      </p>
      <article className="prose dark:prose-invert">
        <Content components={mdxComponents} />
      </article>
    </main>
  );
}
