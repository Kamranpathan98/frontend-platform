import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

import { filterPublished, getAllLessons, getCategories } from "@/lib/content";
import { getCategoryIcon } from "@/lib/category-icons";
import { estimateReadingMinutes } from "@/lib/reading-time";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/difficulty-badge";

export default function HomePage() {
  const published = filterPublished(getAllLessons());
  const categories = getCategories(published);
  const latest = [...published]
    .sort(
      (a, b) =>
        b.frontmatter.updatedAt.getTime() - a.frontmatter.updatedAt.getTime(),
    )
    .slice(0, 6);

  return (
    <main className="mx-auto max-w-300 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <section className="max-w-2xl">
        <span className="font-mono text-xs font-semibold tracking-widest text-primary uppercase">
          Frontend Interview Masterclass
        </span>
        <h1 className="font-heading mt-4 text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
          Frontend interview prep, one lesson at a time.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Focused, no-fluff lessons covering the concepts that actually come
          up in frontend interviews.
        </p>

        {categories.length > 0 ? (
          <Button className="mt-8" size="lg" asChild>
            <Link href={`/${categories[0]}`}>
              Start learning
              <ArrowRight />
            </Link>
          </Button>
        ) : null}
      </section>

      {categories.length === 0 ? (
        <p className="mt-16 text-muted-foreground">
          No lessons published yet — check back soon.
        </p>
      ) : (
        <>
          <section className="mt-16 lg:mt-24">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Explore by topic
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const Icon = getCategoryIcon(category);
                const count = published.filter(
                  (lesson) => lesson.category === category,
                ).length;
                return (
                  <Link key={category} href={`/${category}`} className="group">
                    <Card className="h-full transition-colors group-hover:border-primary">
                      <CardContent className="flex items-center gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-5" aria-hidden />
                        </div>
                        <div>
                          <p className="font-medium text-foreground capitalize">
                            {category.replace(/-/g, " ")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {count} {count === 1 ? "lesson" : "lessons"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mt-16 lg:mt-24">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Latest lessons
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((lesson) => (
                <Link
                  key={`${lesson.category}/${lesson.slug}`}
                  href={`/${lesson.category}/${lesson.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-colors group-hover:border-primary">
                    <CardContent className="flex h-full flex-col">
                      <span className="font-mono text-xs text-muted-foreground capitalize">
                        {lesson.category.replace(/-/g, " ")}
                      </span>
                      <p className="mt-2 font-medium text-foreground">
                        {lesson.frontmatter.title}
                      </p>
                      <p className="mt-1 flex-1 text-sm text-muted-foreground">
                        {lesson.frontmatter.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs">
                        <DifficultyBadge
                          difficulty={lesson.frontmatter.difficulty}
                        />
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
          </section>
        </>
      )}
    </main>
  );
}
