import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  filterPublished,
  getAllLessons,
  getLessonsByTag,
  getTags,
} from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getTags(filterPublished(getAllLessons())).map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `#${tag}`,
    description: `Lessons tagged "${tag}".`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const published = filterPublished(getAllLessons());

  if (!getTags(published).includes(tag)) {
    notFound();
  }

  const lessons = getLessonsByTag(published, tag);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold">#{tag}</h1>
      <ul className="mt-8 space-y-6">
        {lessons.map((lesson) => (
          <li key={`${lesson.category}/${lesson.slug}`}>
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
