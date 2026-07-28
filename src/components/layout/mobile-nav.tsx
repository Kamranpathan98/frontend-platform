"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import type { CategoryNav } from "@/lib/content";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavTree } from "./nav-tree";

export function MobileNav({ categories }: { categories: CategoryNav[] }) {
  const [open, setOpen] = useState(false);

  if (categories.length === 0) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-sidebar">
        <SheetTitle className="px-6 pt-6 font-heading">Curriculum</SheetTitle>
        <div className="px-6 pb-6">
          <NavTree categories={categories} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
