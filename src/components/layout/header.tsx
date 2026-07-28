import Link from "next/link";

import type { CategoryNav } from "@/lib/content";
import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header({ categories }: { categories: CategoryNav[] }) {
  return (
    <header className="border-border/60 sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <Container className="flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MobileNav categories={categories} />
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Frontend Learning Platform
          </Link>
        </div>
        <ThemeToggle />
      </Container>
    </header>
  );
}
