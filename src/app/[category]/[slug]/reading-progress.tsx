"use client";

import { useEffect, useState } from "react";

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ReadingProgress() {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = scrollable > 0 ? window.scrollY / scrollable : 0;
      setPercent(Math.min(100, Math.max(0, Math.round(scrolled * 100))));
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;

  return (
    <div className="flex items-center gap-3">
      <div className="relative size-12 shrink-0">
        <svg className="size-full -rotate-90" viewBox="0 0 40 40">
          <circle
            className="text-muted"
            cx="20"
            cy="20"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <circle
            className="text-primary transition-[stroke-dashoffset] duration-150"
            cx="20"
            cy="20"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-foreground">
          {percent}%
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Reading progress</p>
        <p className="text-xs text-muted-foreground">
          {percent >= 100 ? "You've reached the end" : "Keep going"}
        </p>
      </div>
    </div>
  );
}
