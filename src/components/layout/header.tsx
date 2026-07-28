import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="border-border/60 sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Frontend Learning Platform
        </Link>
        <ThemeToggle />
      </Container>
    </header>
  );
}
