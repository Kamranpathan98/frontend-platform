import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { mdxComponents } from "@/components/mdx";
import { filterPublished, getAllLessons } from "@/lib/content";
import { compileLessonBody } from "@/lib/mdx";
import { TableOfContents } from "./table-of-contents";

// Fully static: any URL not returned by generateStaticParams (including
// draft/review lessons) 404s instead of falling back to an on-demand
// dynamic render.
export const dynamicParams = false;

export function generateStaticParams() {
  return filterPublished(getAllLessons()).map((lesson) => ({
    category: lesson.category,
    slug: lesson.slug,
  }));
}

function findLesson(category: string, slug: string) {
  return filterPublished(getAllLessons()).find(
    (lesson) => lesson.category === category && lesson.slug === slug,
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const lesson = findLesson(category, slug);
  if (!lesson) return {};

  const { title, description } = lesson.frontmatter;

  return {
    title,
    description,
    alternates: { canonical: `/${category}/${slug}` },
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const lesson = findLesson(category, slug);

  if (!lesson) {
    notFound();
  }

  const { Content, toc } = await compileLessonBody(lesson.body);

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12">
        <article className="prose dark:prose-invert min-w-0">
          <h1>{lesson.frontmatter.title}</h1>
          <Content components={mdxComponents} />
        </article>
        <TableOfContents toc={toc} />
      </div>
    </main>
  );
}
