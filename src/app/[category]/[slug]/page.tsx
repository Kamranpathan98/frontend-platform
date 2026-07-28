import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, CalendarClock, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { mdxComponents } from "@/components/mdx";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  filterPublished,
  getAllLessons,
  getLessonsByCategory,
  getRelatedLessons,
} from "@/lib/content";
import { estimateReadingMinutes } from "@/lib/reading-time";
import {
  buildLessonArticleJsonLd,
  buildLessonBreadcrumbJsonLd,
} from "@/lib/json-ld";
import { compileLessonBody } from "@/lib/mdx";
import { TableOfContents } from "./table-of-contents";
import { ReadingProgress } from "./reading-progress";

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
  const published = filterPublished(getAllLessons());
  const lesson = findLesson(category, slug);

  if (!lesson) {
    notFound();
  }

  const { Content, toc } = await compileLessonBody(lesson.body);
  const categoryLessons = getLessonsByCategory(published, category);
  const index = categoryLessons.findIndex((entry) => entry.slug === slug);
  const previous = index > 0 ? categoryLessons[index - 1] : undefined;
  const next =
    index >= 0 && index < categoryLessons.length - 1
      ? categoryLessons[index + 1]
      : undefined;
  const related = getRelatedLessons(lesson, published);

  return (
    <main className="mx-auto max-w-300 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
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
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
        <article className="min-w-0" data-pagefind-body>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase"
          >
            <Link href={`/${category}`} className="hover:text-primary">
              {category.replace(/-/g, " ")}
            </Link>
            <span>/</span>
            <span className="text-foreground">{lesson.frontmatter.title}</span>
          </nav>

          <h1 className="font-heading mt-4 text-3xl font-bold text-foreground lg:text-4xl">
            {lesson.frontmatter.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <DifficultyBadge difficulty={lesson.frontmatter.difficulty} />
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              {estimateReadingMinutes(lesson.body)} min read
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarClock className="size-4" aria-hidden />
              Updated{" "}
              {lesson.frontmatter.updatedAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

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

          <div className="prose dark:prose-invert mt-10 max-w-none">
            <Content components={mdxComponents} />
          </div>

          <div className="mt-16 flex items-center justify-between gap-4 border-t border-border pt-8">
            {previous ? (
              <Link
                href={`/${category}/${previous.slug}`}
                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                <span>
                  <span className="block text-xs uppercase">Previous</span>
                  {previous.frontmatter.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/${category}/${next.slug}`}
                className="group flex items-center gap-2 text-right text-sm font-medium text-primary"
              >
                <span>
                  <span className="block text-xs text-muted-foreground uppercase">
                    Next
                  </span>
                  {next.frontmatter.title}
                </span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : null}
          </div>
        </article>

        <aside className="mt-12 space-y-10 lg:mt-0">
          <div className="lg:sticky lg:top-24 lg:space-y-10">
            <ReadingProgress />
            <TableOfContents toc={toc} />
            {related.length > 0 ? (
              <div>
                <p className="mb-3 font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Related lessons
                </p>
                <div className="space-y-3">
                  {related.map((entry) => (
                    <Link
                      key={`${entry.category}/${entry.slug}`}
                      href={`/${entry.category}/${entry.slug}`}
                    >
                      <Card className="transition-colors hover:border-primary">
                        <CardContent>
                          <p className="text-sm font-medium text-foreground">
                            {entry.frontmatter.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {entry.frontmatter.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}
