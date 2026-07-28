"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function NavLink({
  href,
  children,
  className,
  onNavigate,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "block border-l-2 py-1 pl-3 transition-colors",
        isActive
          ? "border-primary font-medium text-primary"
          : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}
