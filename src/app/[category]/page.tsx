import type { Metadata } from "next";
import { Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  filterPublished,
  getAllLessons,
  getCategories,
  getLessonsByCategory,
} from "@/lib/content";
import { getCategoryIcon } from "@/lib/category-icons";
import { estimateReadingMinutes } from "@/lib/reading-time";
import { Card, CardContent } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/difficulty-badge";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategories(filterPublished(getAllLessons())).map((category) => ({
    category,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  return {
    title: category,
    description: `Interview-prep lessons in ${category}.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const published = filterPublished(getAllLessons());

  if (!getCategories(published).includes(category)) {
    notFound();
  }

  const lessons = getLessonsByCategory(published, category);
  const Icon = getCategoryIcon(category);
  const label = category.replace(/-/g, " ");

  return (
    <main className="mx-auto max-w-300 px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <header className="rounded-2xl border border-border bg-sidebar p-6 lg:p-8">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" aria-hidden />
          </div>
          <span className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
          </span>
        </div>
        <h1 className="font-heading mt-3 text-xl font-bold text-foreground capitalize lg:text-2xl">
          {label}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Interview-prep lessons in {label}.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <Link
            key={lesson.slug}
            href={`/${lesson.category}/${lesson.slug}`}
            className="group"
          >
            <Card className="h-full transition-colors group-hover:border-primary">
              <CardContent className="flex h-full flex-col">
                <p className="font-medium text-foreground">
                  {lesson.frontmatter.title}
                </p>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">
                  {lesson.frontmatter.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs">
                  <DifficultyBadge difficulty={lesson.frontmatter.difficulty} />
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden />
                    {estimateReadingMinutes(lesson.body)} min
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
