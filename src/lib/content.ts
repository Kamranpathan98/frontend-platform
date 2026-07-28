import fs from "node:fs";
import path from "node:path";

import { load as loadYaml } from "js-yaml";

import { lessonFrontmatterSchema, type LessonFrontmatter } from "./schema";

const CONTENT_ROOT = path.join(process.cwd(), "content", "lessons");

export type Lesson = {
  frontmatter: LessonFrontmatter;
  category: string;
  slug: string;
  body: string;
};

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function splitFrontmatter(raw: string): {
  rawFrontmatter: string;
  body: string;
} {
  const match = raw.match(FRONTMATTER_PATTERN);
  if (!match) {
    throw new Error(
      "Missing frontmatter block (expected `---` delimiters at the top of the file).",
    );
  }
  return { rawFrontmatter: match[1], body: match[2] };
}

function readLesson(category: string, slug: string): Lesson {
  const lessonPath = `content/lessons/${category}/${slug}/index.mdx`;
  const filePath = path.join(CONTENT_ROOT, category, slug, "index.mdx");
  const raw = fs.readFileSync(filePath, "utf8");
  const { rawFrontmatter, body } = splitFrontmatter(raw);

  let parsedYaml: unknown;
  try {
    parsedYaml = loadYaml(rawFrontmatter);
  } catch (cause) {
    throw new Error(
      `Invalid YAML frontmatter in ${lessonPath}: ${(cause as Error).message}`,
    );
  }

  const result = lessonFrontmatterSchema.safeParse(parsedYaml);
  if (!result.success) {
    const issues = result.error.issues
      .map(
        (issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`,
      )
      .join("\n");
    throw new Error(`Invalid frontmatter in ${lessonPath}:\n${issues}`);
  }

  if (result.data.category !== category) {
    throw new Error(
      `Frontmatter category "${result.data.category}" does not match folder category "${category}" in ${lessonPath}.`,
    );
  }

  return { frontmatter: result.data, category, slug, body };
}

function listDirectories(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

export function getAllLessons(): Lesson[] {
  const lessons: Lesson[] = [];
  for (const category of listDirectories(CONTENT_ROOT)) {
    for (const slug of listDirectories(path.join(CONTENT_ROOT, category))) {
      lessons.push(readLesson(category, slug));
    }
  }
  return lessons;
}

/** Production-visible lessons only. Draft and in-review lessons are excluded. */
export function filterPublished(lessons: Lesson[]): Lesson[] {
  return lessons.filter((lesson) => lesson.frontmatter.status === "published");
}

/**
 * Deterministic listing order: `order` first, then slug as a tiebreaker so
 * two lessons that collide on `order` still sort the same way on every
 * rebuild (per architecture-doc Risk #9 -- file-system iteration order is
 * not guaranteed stable, so this must never be left to fall through to it).
 */
export function sortLessons(lessons: Lesson[]): Lesson[] {
  return [...lessons].sort(
    (a, b) =>
      a.frontmatter.order - b.frontmatter.order || a.slug.localeCompare(b.slug),
  );
}

export function getCategories(lessons: Lesson[]): string[] {
  return [...new Set(lessons.map((lesson) => lesson.category))].sort();
}

export function getTags(lessons: Lesson[]): string[] {
  return [
    ...new Set(lessons.flatMap((lesson) => lesson.frontmatter.tags)),
  ].sort();
}

export function getLessonsByCategory(
  lessons: Lesson[],
  category: string,
): Lesson[] {
  return sortLessons(lessons.filter((lesson) => lesson.category === category));
}

export function getLessonsByTag(lessons: Lesson[], tag: string): Lesson[] {
  return sortLessons(
    lessons.filter((lesson) => lesson.frontmatter.tags.includes(tag)),
  );
}

/**
 * Explicit `related[]` wins when present. Otherwise falls back to lessons in
 * the same category sharing at least one tag, ranked by shared-tag count
 * with a deterministic tiebreaker (order, then slug) so results are stable
 * across rebuilds. Per architecture doc §6: "10 lines of code, good enough."
 */
export function getRelatedLessons(
  lesson: Lesson,
  allLessons: Lesson[],
  limit = 3,
): Lesson[] {
  if (lesson.frontmatter.related.length > 0) {
    const bySlugRef = new Map(
      allLessons.map((candidate) => [
        `${candidate.category}/${candidate.slug}`,
        candidate,
      ]),
    );
    return lesson.frontmatter.related
      .map((ref) => bySlugRef.get(ref))
      .filter((candidate): candidate is Lesson => candidate !== undefined)
      .slice(0, limit);
  }

  return allLessons
    .filter(
      (candidate) =>
        candidate.category === lesson.category &&
        candidate.slug !== lesson.slug,
    )
    .map((candidate) => ({
      candidate,
      sharedTags: candidate.frontmatter.tags.filter((tag) =>
        lesson.frontmatter.tags.includes(tag),
      ).length,
    }))
    .filter((entry) => entry.sharedTags > 0)
    .sort(
      (a, b) =>
        b.sharedTags - a.sharedTags ||
        a.candidate.frontmatter.order - b.candidate.frontmatter.order ||
        a.candidate.slug.localeCompare(b.candidate.slug),
    )
    .slice(0, limit)
    .map((entry) => entry.candidate);
}
