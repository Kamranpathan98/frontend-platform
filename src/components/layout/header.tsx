import { LineChart, Search } from "lucide-react";
import Link from "next/link";

import type { CategoryNav } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header({ categories }: { categories: CategoryNav[] }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4" wide>
        <div className="flex items-center gap-2">
          <MobileNav categories={categories} />
          <Link
            href="/"
            className="font-heading text-lg font-bold tracking-tight text-foreground"
          >
            FrontendPro
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/progress" aria-label="My learning progress">
              <LineChart />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/search" aria-label="Search lessons">
              <Search />
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
