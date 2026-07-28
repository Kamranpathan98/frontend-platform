import { ImageResponse } from "next/og";

import { filterPublished, getAllLessons } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Auto-generated per lesson from title/category, zero per-lesson manual
// work (architecture doc §15). Deliberately additive: deleting this file
// does not affect lesson rendering at all (§13's escape-hatch
// requirement) -- it only removes the OG image Next would otherwise emit.
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const lesson = filterPublished(getAllLessons()).find(
    (l) => l.category === category && l.slug === slug,
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        backgroundColor: "#0a0a0f",
        color: "#fafafa",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 28,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 4,
          color: "#818cf8",
        }}
      >
        {lesson?.category ?? category}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 64,
          fontWeight: 700,
          lineHeight: 1.15,
          maxWidth: "90%",
        }}
      >
        {lesson?.frontmatter.title ?? "Frontend Learning Platform"}
      </div>
      <div style={{ display: "flex", fontSize: 26, color: "#a1a1aa" }}>
        Frontend Learning Platform
      </div>
    </div>,
    { ...size },
  );
}
