import { describe, expect, it } from "vitest";

import {
  filterPublished,
  getCategories,
  getCategoryNav,
  getLessonsByCategory,
  getLessonsByTag,
  getRelatedLessons,
  getTags,
  sortLessons,
  type Lesson,
} from "./content";
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

describe("sortLessons", () => {
  it("orders by the order field", () => {
    const lessons = [
      makeLesson({ slug: "third", order: 3 }),
      makeLesson({ slug: "first", order: 1 }),
      makeLesson({ slug: "second", order: 2 }),
    ];

    expect(sortLessons(lessons).map((l) => l.slug)).toEqual([
      "first",
      "second",
      "third",
    ]);
  });

  it("breaks order collisions deterministically by slug, not insertion order", () => {
    const lessons = [
      makeLesson({ slug: "zebra", order: 1 }),
      makeLesson({ slug: "apple", order: 1 }),
    ];

    expect(sortLessons(lessons).map((l) => l.slug)).toEqual(["apple", "zebra"]);
    // Reversed input must produce the same output -- proves this doesn't
    // silently depend on file-system iteration order.
    expect(sortLessons([...lessons].reverse()).map((l) => l.slug)).toEqual([
      "apple",
      "zebra",
    ]);
  });
});

describe("getCategories", () => {
  it("returns unique, alphabetically sorted categories", () => {
    const lessons = [
      makeLesson({ category: "react", slug: "hooks" }),
      makeLesson({ category: "javascript", slug: "closures" }),
      makeLesson({ category: "javascript", slug: "hoisting" }),
    ];

    expect(getCategories(lessons)).toEqual(["javascript", "react"]);
  });
});

describe("getTags", () => {
  it("returns unique, alphabetically sorted tags across lessons", () => {
    const lessons = [
      makeLesson({ slug: "a", tags: ["scope", "fundamentals"] }),
      makeLesson({ slug: "b", tags: ["fundamentals", "closures"] }),
    ];

    expect(getTags(lessons)).toEqual(["closures", "fundamentals", "scope"]);
  });
});

describe("getLessonsByCategory", () => {
  it("filters to the category and applies sortLessons ordering", () => {
    const lessons = [
      makeLesson({ category: "css", slug: "flexbox", order: 1 }),
      makeLesson({ category: "javascript", slug: "hoisting", order: 2 }),
      makeLesson({ category: "javascript", slug: "closures", order: 1 }),
    ];

    expect(
      getLessonsByCategory(lessons, "javascript").map((l) => l.slug),
    ).toEqual(["closures", "hoisting"]);
  });
});

describe("getLessonsByTag", () => {
  it("filters to lessons carrying the tag and applies sortLessons ordering", () => {
    const lessons = [
      makeLesson({ slug: "hoisting", tags: ["scope"], order: 2 }),
      makeLesson({ slug: "closures", tags: ["scope"], order: 1 }),
      makeLesson({ slug: "promises", tags: ["async"], order: 1 }),
    ];

    expect(getLessonsByTag(lessons, "scope").map((l) => l.slug)).toEqual([
      "closures",
      "hoisting",
    ]);
  });
});

describe("getCategoryNav", () => {
  it("groups lessons by category, ordered, with only slug/title exposed", () => {
    const lessons = [
      makeLesson({
        category: "react",
        slug: "hooks",
        order: 1,
        title: "Hooks",
      }),
      makeLesson({
        category: "javascript",
        slug: "hoisting",
        order: 2,
        title: "Hoisting",
      }),
      makeLesson({
        category: "javascript",
        slug: "closures",
        order: 1,
        title: "Closures",
      }),
    ];

    expect(getCategoryNav(lessons)).toEqual([
      {
        category: "javascript",
        lessons: [
          { slug: "closures", title: "Closures" },
          { slug: "hoisting", title: "Hoisting" },
        ],
      },
      {
        category: "react",
        lessons: [{ slug: "hooks", title: "Hooks" }],
      },
    ]);
  });
});
