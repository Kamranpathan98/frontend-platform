import { filterPublished, getAllLessons } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const published = [...filterPublished(getAllLessons())].sort(
    (a, b) =>
      b.frontmatter.updatedAt.getTime() - a.frontmatter.updatedAt.getTime(),
  );

  const items = published
    .map((lesson) => {
      const url = `${SITE_URL}/${lesson.category}/${lesson.slug}`;
      return `    <item>
      <title>${escapeXml(lesson.frontmatter.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description>${escapeXml(lesson.frontmatter.description)}</description>
      <pubDate>${lesson.frontmatter.updatedAt.toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Frontend Learning Platform</title>
    <link>${SITE_URL}</link>
    <description>Frontend interview preparation, one lesson at a time.</description>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
