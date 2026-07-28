#!/usr/bin/env node
// Copies each lesson's co-located content/lessons/<category>/<slug>/assets/
// into public/lessons/<category>/<slug>/assets/ so <Figure> can reference
// them as ordinary static files, on any static host -- no runtime file
// serving, no dependency on Vercel-specific request handling. Addresses
// architecture-doc Top Risk #1 (content living outside /src breaking
// Next's static asset assumptions).
import fs from "node:fs";
import path from "node:path";

const CONTENT_ROOT = path.join(process.cwd(), "content", "lessons");
const PUBLIC_ROOT = path.join(process.cwd(), "public", "lessons");

function listDirectories(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function copyLessonAssets(category, slug) {
  const src = path.join(CONTENT_ROOT, category, slug, "assets");
  if (!fs.existsSync(src)) return;

  const dest = path.join(PUBLIC_ROOT, category, slug, "assets");
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function main() {
  let count = 0;
  for (const category of listDirectories(CONTENT_ROOT)) {
    for (const slug of listDirectories(path.join(CONTENT_ROOT, category))) {
      copyLessonAssets(category, slug);
      count += 1;
    }
  }
  console.log(`copy-lesson-assets: synced assets/ for ${count} lesson(s).`);
}

main();
