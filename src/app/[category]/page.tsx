import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  filterPublished,
  getAllLessons,
  getCategories,
  getLessonsByCategory,
} from "@/lib/content";

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

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold capitalize">{category}</h1>
      <ul className="mt-8 space-y-6">
        {lessons.map((lesson) => (
          <li key={lesson.slug}>
            <Link
              href={`/${lesson.category}/${lesson.slug}`}
              className="text-lg font-medium hover:underline"
            >
              {lesson.frontmatter.title}
            </Link>
            <p className="text-muted-foreground text-sm">
              {lesson.frontmatter.description}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
