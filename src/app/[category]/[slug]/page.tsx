import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { mdxComponents } from "@/components/mdx";
import { filterPublished, getAllLessons } from "@/lib/content";
import {
  buildLessonArticleJsonLd,
  buildLessonBreadcrumbJsonLd,
} from "@/lib/json-ld";
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildLessonArticleJsonLd(lesson)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildLessonBreadcrumbJsonLd(lesson)),
        }}
      />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12">
        <article className="prose dark:prose-invert min-w-0" data-pagefind-body>
          <h1>{lesson.frontmatter.title}</h1>
          {/* data-pagefind-ignore keeps this out of the indexed body text
              and excerpt while data-pagefind-filter still reads it -- see
              https://pagefind.app/docs/indexing-attributes/ */}
          <span hidden data-pagefind-ignore>
            <span data-pagefind-filter="category">{lesson.category}</span>
            {lesson.frontmatter.tags.map((tag) => (
              <span key={tag} data-pagefind-filter="tags">
                {tag}
              </span>
            ))}
          </span>
          <Content components={mdxComponents} />
        </article>
        <TableOfContents toc={toc} />
      </div>
    </main>
  );
}
