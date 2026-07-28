import { describe, expect, it } from "vitest";

import { filterPublished, getRelatedLessons, type Lesson } from "./content";
import type { LessonFrontmatter } from "./schema";

function makeLesson(
  overrides: Partial<LessonFrontmatter> & {
    category?: string;
    slug?: string;
  } = {},
): Lesson {
  const {
    category = "javascript",
    slug = "example",
    ...frontmatterOverrides
  } = overrides;
  const frontmatter: LessonFrontmatter = {
    schemaVersion: 1,
    title: "Example",
    description: "An example lesson.",
    category,
    tags: [],
    difficulty: "beginner",
    order: 1,
    related: [],
    updatedAt: new Date("2026-07-28"),
    status: "published",
    ...frontmatterOverrides,
  };
  return { frontmatter, category, slug, body: "" };
}

describe("filterPublished", () => {
  it("excludes draft and review lessons, keeping only published", () => {
    const lessons = [
      makeLesson({ slug: "a", status: "draft" }),
      makeLesson({ slug: "b", status: "review" }),
      makeLesson({ slug: "c", status: "published" }),
    ];

    expect(filterPublished(lessons).map((l) => l.slug)).toEqual(["c"]);
  });
});

describe("getRelatedLessons", () => {
  it("uses explicit related[] when present, ignoring tag overlap entirely", () => {
    const hoisting = makeLesson({ slug: "hoisting", tags: [] });
    const taggedButNotListed = makeLesson({
      slug: "scope-chain",
      tags: ["scope"],
    });
    const target = makeLesson({
      slug: "closures",
      tags: ["scope"],
      related: ["javascript/hoisting"],
    });

    const result = getRelatedLessons(target, [
      target,
      hoisting,
      taggedButNotListed,
    ]);

    expect(result.map((l) => l.slug)).toEqual(["hoisting"]);
  });

  it("falls back to same-category lessons sharing tags, ranked by shared-tag count", () => {
    const target = makeLesson({
      slug: "closures",
      tags: ["scope", "functions"],
      related: [],
    });
    const twoShared = makeLesson({
      slug: "hoisting",
      tags: ["scope", "functions"],
      order: 2,
    });
    const oneShared = makeLesson({
      slug: "this-keyword",
      tags: ["scope"],
      order: 3,
    });
    const noShared = makeLesson({
      slug: "promises",
      tags: ["async"],
      order: 4,
    });
    const differentCategory = makeLesson({
      category: "css",
      slug: "flexbox",
      tags: ["scope", "functions"],
      order: 1,
    });

    const result = getRelatedLessons(target, [
      target,
      twoShared,
      oneShared,
      noShared,
      differentCategory,
    ]);

    expect(result.map((l) => l.slug)).toEqual(["hoisting", "this-keyword"]);
  });

  it("breaks shared-tag ties deterministically by order, then slug", () => {
    const target = makeLesson({
      slug: "closures",
      tags: ["scope"],
      related: [],
    });
    const b = makeLesson({ slug: "b-lesson", tags: ["scope"], order: 5 });
    const a = makeLesson({ slug: "a-lesson", tags: ["scope"], order: 5 });
    const c = makeLesson({ slug: "c-lesson", tags: ["scope"], order: 1 });

    const result = getRelatedLessons(target, [target, b, a, c]);

    expect(result.map((l) => l.slug)).toEqual([
      "c-lesson",
      "a-lesson",
      "b-lesson",
    ]);
  });

  it("respects the limit parameter", () => {
    const target = makeLesson({
      slug: "closures",
      tags: ["scope"],
      related: [],
    });
    const others = [1, 2, 3, 4].map((n) =>
      makeLesson({ slug: `lesson-${n}`, tags: ["scope"], order: n }),
    );

    const result = getRelatedLessons(target, [target, ...others], 2);

    expect(result).toHaveLength(2);
  });

  it("returns an empty array when nothing matches", () => {
    const target = makeLesson({
      slug: "closures",
      tags: ["scope"],
      related: [],
    });
    const differentCategory = makeLesson({
      category: "css",
      slug: "flexbox",
      tags: ["scope"],
    });
    const noOverlap = makeLesson({ slug: "promises", tags: ["async"] });

    const result = getRelatedLessons(target, [
      target,
      differentCategory,
      noOverlap,
    ]);

    expect(result).toEqual([]);
  });
});
