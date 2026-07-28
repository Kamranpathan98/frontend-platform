"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, Play } from "lucide-react";

import { Button } from "@/components/ui/button";

// ssr:false + dynamic import means this chunk (and therefore Sandpack
// itself) is only ever fetched after `active` becomes true -- never part
// of the initial page load, per architecture doc §14. `loading` covers the
// gap between the click and the chunk arriving, so the button click has
// visible feedback instead of appearing to do nothing.
const SandpackEmbed = dynamic(() => import("./sandpack-embed"), {
  ssr: false,
  loading: () => (
    <div className="flex h-75 items-center justify-center rounded-xl border border-border bg-muted">
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
    </div>
  ),
});

export function PlaygroundClient({
  code,
  template,
  staticHtml,
}: {
  code: string;
  template: "vanilla" | "react";
  staticHtml: string;
}) {
  const [active, setActive] = useState(false);

  if (active) {
    return <SandpackEmbed code={code} template={template} />;
  }

  return (
    <div className="relative">
      <div
        // Server-rendered Shiki output -- this is what a reader with JS
        // disabled sees permanently, since without hydration `active` can
        // never become true and this branch never gets replaced.
        dangerouslySetInnerHTML={{ __html: staticHtml }}
      />
      <Button
        type="button"
        onClick={() => setActive(true)}
        className="absolute right-3 bottom-3"
        size="sm"
      >
        <Play />
        Run playground
      </Button>
    </div>
  );
}
