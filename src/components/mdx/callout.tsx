import type { ReactNode } from "react";
import { AlertTriangle, Info, Lightbulb, OctagonAlert } from "lucide-react";

import { cn } from "@/lib/utils";

const CALLOUT_STYLES = {
  info: {
    icon: Info,
    className:
      "border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-100",
  },
  tip: {
    icon: Lightbulb,
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
  },
  warning: {
    icon: AlertTriangle,
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100",
  },
  danger: {
    icon: OctagonAlert,
    className: "border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-100",
  },
} as const;

export type CalloutType = keyof typeof CALLOUT_STYLES;

export function Callout({
  type = "info",
  children,
}: {
  type?: CalloutType;
  children: ReactNode;
}) {
  const { icon: Icon, className } = CALLOUT_STYLES[type];

  return (
    <div
      className={cn("my-6 flex gap-3 rounded-lg border p-4 text-sm", className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="[&>p]:m-0">{children}</div>
    </div>
  );
}
