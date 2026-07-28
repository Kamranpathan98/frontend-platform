import type { Lesson } from "./content";
import { SITE_URL } from "./site";

/**
 * `TechArticle` (a schema.org `Article` subtype) rather than plain
 * `Article`, since lessons are technical/how-to content -- matches the
 * architecture doc §15's explicit "Article/TechArticle" call-out.
 * `datePublished` reuses `updatedAt` since the content schema (M6) only
 * tracks one date field; this is a deliberate simplification, not an
 * oversight.
 */
export function buildLessonArticleJsonLd(lesson: Lesson) {
  const url = `${SITE_URL}/${lesson.category}/${lesson.slug}`;
  const isoDate = lesson.frontmatter.updatedAt.toISOString();
  const publisher = {
    "@type": "Organization",
    name: "Frontend Learning Platform",
    url: SITE_URL,
  };

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: lesson.frontmatter.title,
    description: lesson.frontmatter.description,
    image: `${url}/opengraph-image`,
    datePublished: isoDate,
    dateModified: isoDate,
    url,
    mainEntityOfPage: url,
    articleSection: lesson.category,
    keywords: lesson.frontmatter.tags.join(", "),
    // No individual byline in the content schema -- attributed to the site
    // itself rather than inventing a person, per Google's guidance that
    // author may be an Organization when there's no named author.
    author: publisher,
    publisher,
  };
}

export function buildLessonBreadcrumbJsonLd(lesson: Lesson) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: lesson.category,
        item: `${SITE_URL}/${lesson.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: lesson.frontmatter.title,
        item: `${SITE_URL}/${lesson.category}/${lesson.slug}`,
      },
    ],
  };
}
