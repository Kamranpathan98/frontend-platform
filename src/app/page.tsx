import Link from "next/link";

import { filterPublished, getAllLessons, getCategories } from "@/lib/content";

export default function HomePage() {
  const published = filterPublished(getAllLessons());
  const categories = getCategories(published);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Frontend Learning Platform</h1>
      <p className="text-muted-foreground mt-4">
        Frontend interview preparation, one lesson at a time.
      </p>

      {categories.length === 0 ? (
        <p className="text-muted-foreground mt-12">
          No lessons published yet — check back soon.
        </p>
      ) : (
        <ul className="mt-12 space-y-3">
          {categories.map((category) => (
            <li key={category}>
              <Link
                href={`/${category}`}
                className="text-lg font-medium capitalize hover:underline"
              >
                {category}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
