import type { MetadataRoute } from "next";

import {
  filterPublished,
  getAllLessons,
  getCategories,
  getTags,
} from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const published = filterPublished(getAllLessons());

  const lessonEntries: MetadataRoute.Sitemap = published.map((lesson) => ({
    url: `${SITE_URL}/${lesson.category}/${lesson.slug}`,
    lastModified: lesson.frontmatter.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = getCategories(published).map(
    (category) => ({
      url: `${SITE_URL}/${category}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }),
  );

  const tagEntries: MetadataRoute.Sitemap = getTags(published).map((tag) => ({
    url: `${SITE_URL}/tags/${tag}`,
    changeFrequency: "weekly",
    priority: 0.3,
  }));

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...categoryEntries,
    ...lessonEntries,
    ...tagEntries,
  ];
}
