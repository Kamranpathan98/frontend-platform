"use client";

// The only file in this codebase that imports @codesandbox/sandpack-react.
// Loaded exclusively via next/dynamic({ ssr: false }) from
// playground-client.tsx, so it never ships in the initial bundle -- only
// fetched once a reader actually clicks "Run".
import { Sandpack } from "@codesandbox/sandpack-react";

export default function SandpackEmbed({
  code,
  template,
}: {
  code: string;
  template: "vanilla" | "react";
}) {
  const entryFile = template === "react" ? "/App.js" : "/index.js";

  return (
    <Sandpack
      template={template}
      theme="auto"
      files={{ [entryFile]: code }}
      options={{ showConsole: true, showConsoleButton: true }}
    />
  );
}
