import { Signal, SignalHigh, SignalLow, SignalMedium } from "lucide-react";

import type { LessonFrontmatter } from "@/lib/schema";
import { cn } from "@/lib/utils";

const DIFFICULTY_STYLES: Record<
  LessonFrontmatter["difficulty"],
  { icon: typeof Signal; className: string; label: string }
> = {
  beginner: {
    icon: SignalLow,
    className: "text-success",
    label: "Beginner",
  },
  intermediate: {
    icon: SignalMedium,
    className: "text-primary",
    label: "Intermediate",
  },
  advanced: {
    icon: SignalHigh,
    className: "text-warning",
    label: "Advanced",
  },
};

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: LessonFrontmatter["difficulty"];
  className?: string;
}) {
  const { icon: Icon, className: colorClassName, label } =
    DIFFICULTY_STYLES[difficulty];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium",
        colorClassName,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}
