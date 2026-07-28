"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, Play, TriangleAlert } from "lucide-react";

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

// Sandpack bundles and runs code in an iframe it loads from an external
// CodeSandbox service -- ad blockers, privacy extensions, and restrictive
// networks can silently prevent that iframe from ever finishing startup,
// leaving the embed stuck (verified: this is where a broken/blank console
// panel traces back to, not our theme or CSS). There's no reliable local
// signal for that failure, so a plain elapsed-time heuristic is the
// pragmatic fallback: past a generous grace period, point the reader at
// "Open Sandbox" (CodeSandbox's own full page, unaffected by the local
// iframe failing) instead of leaving them staring at a stuck panel.
const SLOW_LOAD_TIMEOUT_MS = 8000;

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
  const [slowLoad, setSlowLoad] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setSlowLoad(true), SLOW_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [active]);

  if (active) {
    return (
      <div className="space-y-3">
        {slowLoad && (
          <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-foreground">
            <TriangleAlert className="size-4 shrink-0 text-warning" aria-hidden />
            <p>
              This is taking longer than expected to load — the embedded
              sandbox can be blocked by ad blockers or restrictive networks.
              Try the <span className="font-medium">Open Sandbox</span>{" "}
              button in the panel below to run it directly on CodeSandbox
              instead.
            </p>
          </div>
        )}
        <SandpackEmbed code={code} template={template} />
      </div>
    );
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
