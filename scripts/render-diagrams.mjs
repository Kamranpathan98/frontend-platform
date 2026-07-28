#!/usr/bin/env node
// Local authoring step: finds every content/lessons/**/assets/*.mmd file
// (raw Mermaid source) and renders it to a sibling .svg via mermaid-isomorphic
// + Playwright. Run this after adding or editing a diagram, then commit both
// the .mmd source and the generated .svg.
//
// Deliberately NOT wired into `build`/`dev`: rendering Mermaid needs a real
// browser (Playwright/Chromium) for correct layout, and Vercel's build
// container is missing the shared libraries Chromium needs to launch, with
// no apt/root access to install them. Pre-rendering locally and committing
// the SVG (the same pattern <Figure> already uses for images) sidesteps
// that entirely -- the Vercel build never touches Playwright.
import fs from "node:fs";
import path from "node:path";
import { createMermaidRenderer } from "mermaid-isomorphic";

const CONTENT_ROOT = path.join(process.cwd(), "content", "lessons");

function findMermaidSources(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMermaidSources(entryPath));
    } else if (entry.isFile() && entry.name.endsWith(".mmd")) {
      results.push(entryPath);
    }
  }
  return results;
}

async function main() {
  const sources = findMermaidSources(CONTENT_ROOT);

  if (sources.length === 0) {
    console.log("render-diagrams: no .mmd files found under content/lessons/.");
    return;
  }

  const render = createMermaidRenderer();
  let failed = 0;

  for (const sourcePath of sources) {
    const chart = fs.readFileSync(sourcePath, "utf8");
    const [result] = await render([chart]);
    const svgPath = sourcePath.replace(/\.mmd$/, ".svg");
    const relativePath = path.relative(process.cwd(), sourcePath);

    if (result.status === "rejected") {
      failed += 1;
      const reason =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);
      console.error(`render-diagrams: FAILED ${relativePath}\n  ${reason}`);
      continue;
    }

    fs.writeFileSync(svgPath, result.value.svg);
    console.log(
      `render-diagrams: wrote ${path.relative(process.cwd(), svgPath)}`,
    );
  }

  if (failed > 0) {
    console.error(`render-diagrams: ${failed} diagram(s) failed to render.`);
    process.exitCode = 1;
  }
}

main();
