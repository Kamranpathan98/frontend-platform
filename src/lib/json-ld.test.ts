import { describe, expect, it } from "vitest";

import {
  buildLessonArticleJsonLd,
  buildLessonBreadcrumbJsonLd,
} from "./json-ld";
import type { Lesson } from "./content";
import type { LessonFrontmatter } from "./schema";

function makeLesson(overrides: Partial<LessonFrontmatter> = {}): Lesson {
  const frontmatter: LessonFrontmatter = {
    schemaVersion: 1,
    title: "Closures",
    description: "How closures work.",
    category: "javascript",
    tags: ["scope", "functions"],
    difficulty: "intermediate",
    order: 1,
    related: [],
    updatedAt: new Date("2026-07-28T00:00:00.000Z"),
    status: "published",
    ...overrides,
  };
  return { frontmatter, category: "javascript", slug: "closures", body: "" };
}

describe("buildLessonArticleJsonLd", () => {
  it("produces a valid TechArticle object with matching dates and URL", () => {
    const jsonLd = buildLessonArticleJsonLd(makeLesson());

    expect(jsonLd["@type"]).toBe("TechArticle");
    expect(jsonLd.headline).toBe("Closures");
    expect(jsonLd.url).toBe(
      "https://frontend-platform-ten.vercel.app/javascript/closures",
    );
    expect(jsonLd.datePublished).toBe("2026-07-28T00:00:00.000Z");
    expect(jsonLd.dateModified).toBe(jsonLd.datePublished);
    expect(jsonLd.keywords).toBe("scope, functions");
    expect(jsonLd.image).toBe(
      "https://frontend-platform-ten.vercel.app/javascript/closures/opengraph-image",
    );
    expect(jsonLd.author).toEqual({
      "@type": "Organization",
      name: "Frontend Learning Platform",
      url: "https://frontend-platform-ten.vercel.app",
    });
    expect(jsonLd.publisher).toEqual(jsonLd.author);
  });
});

describe("buildLessonBreadcrumbJsonLd", () => {
  it("produces a three-level breadcrumb: home, category, lesson", () => {
    const jsonLd = buildLessonBreadcrumbJsonLd(makeLesson());

    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement).toHaveLength(3);
    expect(jsonLd.itemListElement.map((item) => item.name)).toEqual([
      "Home",
      "javascript",
      "Closures",
    ]);
    expect(jsonLd.itemListElement[2]?.item).toBe(
      "https://frontend-platform-ten.vercel.app/javascript/closures",
    );
  });
});
