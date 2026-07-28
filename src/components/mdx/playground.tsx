import { codeToHtml } from "shiki";

import { PlaygroundClient } from "./playground-client";

export async function Playground({
  code,
  template = "vanilla",
}: {
  code: string;
  template?: "vanilla" | "react";
}) {
  // Same dual-theme Shiki config as the rehype-pretty-code pipeline in
  // lib/mdx.ts, so this static fallback is visually identical to a normal
  // code block and picks up the same globals.css dual-theme CSS rules.
  const staticHtml = await codeToHtml(code, {
    lang: template === "react" ? "jsx" : "javascript",
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });

  return (
    <PlaygroundClient code={code} template={template} staticHtml={staticHtml} />
  );
}
