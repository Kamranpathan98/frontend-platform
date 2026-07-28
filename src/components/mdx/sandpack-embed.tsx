"use client";

// The only file in this codebase that imports @codesandbox/sandpack-react.
// Loaded exclusively via next/dynamic({ ssr: false }) from
// playground-client.tsx, so it never ships in the initial bundle -- only
// fetched once a reader actually clicks "Run".
import { useTheme } from "next-themes";
import { Sandpack } from "@codesandbox/sandpack-react";

export default function SandpackEmbed({
  code,
  template,
}: {
  code: string;
  template: "vanilla" | "react";
}) {
  const entryFile = template === "react" ? "/App.js" : "/index.js";
  // Sandpack's own "auto" theme reads `prefers-color-scheme`, which is
  // independent of this app's class-based dark mode toggle -- when the two
  // disagree, Sandpack's panels (esp. the console) render with mismatched,
  // sometimes unreadable colors. Drive it from the app's actual resolved
  // theme instead so it always matches.
  const { resolvedTheme } = useTheme();

  return (
    <Sandpack
      template={template}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      files={{ [entryFile]: code }}
      options={{ showConsole: true, showConsoleButton: true }}
    />
  );
}
