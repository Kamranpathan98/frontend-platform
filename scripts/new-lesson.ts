#!/usr/bin/env node
// Scaffolds content/lessons/<category>/<slug>/index.mdx (+ assets/) with
// valid, schema-passing frontmatter defaulted to `status: draft`. This is
// step one of the publishing loop (architecture-doc §17): the scaffold must
// stay the single source of truth for the lesson template, so it imports the
// real schema from lib/schema.ts instead of redefining the field list here.
//
// Run via `node --experimental-strip-types` (see the `new-lesson` script in
// package.json) rather than adding a ts-node/tsx dependency -- Node's native
// type-stripping is enough for a script this small (§3: prefer no new deps).
// It imports only src/lib/schema.ts, not src/lib/content.ts: content.ts uses
// extension-less relative imports (fine for Next's bundler resolution, not
// resolvable by Node's own ESM loader), and per existing scripts
// (copy-lesson-assets.mjs, render-diagrams.mjs) authoring-time tools read
// content/ directly rather than through the app's content gateway.
import fs from "node:fs";
import path from "node:path";

import { load as loadYaml } from "js-yaml";

import { lessonFrontmatterSchema } from "../src/lib/schema.ts";

const CONTENT_ROOT = path.join(process.cwd(), "content", "lessons");
const SLUG_PATTERN = /^[a-z0-9-]+$/;
const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

// Mirrors architecture-doc §6's section list exactly -- conventions, not
// validated structure, so headings only, no required content.
const SECTIONS = [
  "Concept",
  "Why",
  "Internal Working",
  "Visual Explanation",
  "Examples",
  "Interview Questions",
  "Common Mistakes",
  "Summary",
  "Related Topics",
  "Next Lesson",
  "Revision Notes",
  "Exercises",
];

function titleCase(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function nextOrder(category: string): number {
  const categoryDir = path.join(CONTENT_ROOT, category);
  if (!fs.existsSync(categoryDir)) return 1;
  const existingCount = fs
    .readdirSync(categoryDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory()).length;
  return existingCount + 1;
}

function buildMdx(category: string, slug: string): string {
  const title = titleCase(slug);

  const frontmatter = lessonFrontmatterSchema.parse({
    schemaVersion: 1,
    title,
    description: `TODO -- describe ${title} in one or two sentences.`,
    category,
    tags: [category],
    difficulty: "intermediate",
    order: nextOrder(category),
    related: [],
    updatedAt: new Date().toISOString().slice(0, 10),
    status: "draft",
  });

  const frontmatterBlock = [
    "---",
    `schemaVersion: ${frontmatter.schemaVersion}`,
    `title: ${frontmatter.title}`,
    `description: ${frontmatter.description}`,
    `category: ${frontmatter.category}`,
    `tags: [${frontmatter.tags.join(", ")}]`,
    `difficulty: ${frontmatter.difficulty}`,
    `order: ${frontmatter.order}`,
    `related: []`,
    `updatedAt: ${frontmatter.updatedAt.toISOString().slice(0, 10)}`,
    `status: ${frontmatter.status}`,
    "---",
  ].join("\n");

  const body = SECTIONS.map((heading) => `## ${heading}\n\n{/* TODO */}\n`).join(
    "\n",
  );

  return `${frontmatterBlock}\n\n${body}`;
}

/** Round-trips the written file through the same parse path lib/content.ts
 * uses, so "passes validation with no manual fixes" is proven, not assumed. */
function verifyWritten(filePath: string): void {
  const raw = fs.readFileSync(filePath, "utf8");
  const match = raw.match(FRONTMATTER_PATTERN);
  if (!match) {
    throw new Error("Generated file is missing a `---` frontmatter block.");
  }
  lessonFrontmatterSchema.parse(loadYaml(match[1]));
}

function main() {
  const [category, slug] = process.argv.slice(2);

  if (!category || !slug) {
    console.error("Usage: pnpm new-lesson <category> <slug>");
    process.exitCode = 1;
    return;
  }

  if (!SLUG_PATTERN.test(category) || !SLUG_PATTERN.test(slug)) {
    console.error(
      "<category> and <slug> must be lowercase and hyphenated (e.g. javascript, array-methods).",
    );
    process.exitCode = 1;
    return;
  }

  const lessonDir = path.join(CONTENT_ROOT, category, slug);
  if (fs.existsSync(lessonDir)) {
    console.error(
      `Lesson already exists: ${path.relative(process.cwd(), lessonDir)}`,
    );
    process.exitCode = 1;
    return;
  }

  const indexPath = path.join(lessonDir, "index.mdx");
  // Computed before any directory is created -- nextOrder() counts sibling
  // folders in the category, and must not count this lesson's own folder.
  const mdx = buildMdx(category, slug);

  try {
    fs.mkdirSync(path.join(lessonDir, "assets"), { recursive: true });
    fs.writeFileSync(path.join(lessonDir, "assets", ".gitkeep"), "");
    fs.writeFileSync(indexPath, mdx);
    verifyWritten(indexPath);
  } catch (error) {
    fs.rmSync(lessonDir, { recursive: true, force: true });
    console.error(
      `new-lesson: scaffold failed validation, nothing written.\n${(error as Error).message}`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `new-lesson: created ${path.relative(process.cwd(), indexPath)} (status: draft)`,
  );
}

main();
