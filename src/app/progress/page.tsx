import type { Metadata } from "next";
import { ArrowRight, Flame, Info } from "lucide-react";
import Link from "next/link";

import { filterPublished, getAllLessons, getCategories } from "@/lib/content";
import { getCategoryIcon } from "@/lib/category-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My Learning Progress",
  description: "A preview of the learning progress dashboard.",
};

// Static preview data -- there is no auth or progress tracking in this app
// yet, so every number on this page is a hardcoded placeholder rather than
// real per-user state. Wire this up to real tracking before treating it as
// anything other than a design preview.
const OVERALL_PERCENT = 64;
const STREAK_DAYS = 12;
const STREAK_WEEK = [
  ["Mon", true],
  ["Tue", false],
  ["Wed", true],
  ["Thu", true],
  ["Fri", true],
  ["Sat", false],
  ["Sun", false],
] as const;
const TOPIC_MASTERY_PERCENTS = [90, 40, 65, 25, 10];
const REVIEW_ITEMS = [
  {
    title: "Closures in loops",
    detail: "The classic `var` vs `let` interview question.",
  },
  {
    title: "Debouncing vs throttling",
    detail: "A recurring topic in performance-focused interviews.",
  },
];

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProgressPage() {
  const published = filterPublished(getAllLessons());
  const categories = getCategories(published);
  const offset = CIRCUMFERENCE - (OVERALL_PERCENT / 100) * CIRCUMFERENCE;

  return (
    <main className="mx-auto max-w-300 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <p>
          <span className="font-medium">Design preview.</span> Progress
          tracking isn&apos;t wired up yet — every number on this page is a
          placeholder, not real activity.
        </p>
      </div>

      <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="font-mono text-xs font-semibold tracking-widest text-primary uppercase">
            Preview
          </span>
          <h1 className="font-heading mt-2 text-3xl font-bold text-foreground lg:text-4xl">
            My Learning Progress
          </h1>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="relative size-40">
              <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-muted"
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <circle
                  className="text-primary"
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-heading text-3xl font-bold text-foreground">
                  {OVERALL_PERCENT}%
                </span>
                <span className="font-mono text-[10px] text-muted-foreground uppercase">
                  Curriculum
                </span>
              </div>
            </div>
            <h2 className="font-heading mt-4 text-lg font-semibold text-foreground">
              Overall Progress
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sample data — not tracked yet.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-8">
          <CardContent>
            <div className="flex items-center gap-3">
              <Flame className="size-5 text-warning" aria-hidden />
              <h2 className="font-heading text-lg font-semibold text-foreground">
                {STREAK_DAYS} Day Streak
              </h2>
            </div>
            <div className="mt-6 grid grid-cols-7 gap-3">
              {STREAK_WEEK.map(([day, active]) => (
                <div key={day} className="text-center">
                  <p className="mb-2 font-mono text-[10px] text-muted-foreground">
                    {day}
                  </p>
                  <div
                    className={
                      active
                        ? "h-10 rounded-lg border border-primary/30 bg-primary/15"
                        : "h-10 rounded-lg border border-border bg-muted"
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Topic Mastery
          </h2>
          <div className="mt-4 space-y-3">
            {categories.map((category, i) => {
              const Icon = getCategoryIcon(category);
              const percent =
                TOPIC_MASTERY_PERCENTS[i % TOPIC_MASTERY_PERCENTS.length];
              return (
                <Card key={category}>
                  <CardContent className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" aria-hidden />
                      </div>
                      <p className="font-medium text-foreground capitalize">
                        {category.replace(/-/g, " ")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-mono text-xs text-muted-foreground">
                        {percent}%
                      </span>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Topics to Review
          </h2>
          <Card className="mt-4">
            <ul className="divide-y divide-border">
              {REVIEW_ITEMS.map((item) => (
                <li key={item.title} className="p-5">
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="mt-10 flex flex-col items-start gap-6 rounded-2xl border border-primary/30 bg-primary/5 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Ready to keep going?
            </h2>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Jump back into the curriculum and pick up where you left off.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href={`/${categories[0]}`}>
              Browse curriculum
              <ArrowRight />
            </Link>
          </Button>
        </div>
      ) : null}
    </main>
  );
}
