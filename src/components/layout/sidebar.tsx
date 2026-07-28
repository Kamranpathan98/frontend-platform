import type { CategoryNav } from "@/lib/content";
import { NavTree } from "./nav-tree";

export function Sidebar({ categories }: { categories: CategoryNav[] }) {
  if (categories.length === 0) return null;

  return (
    <aside className="hidden w-72 shrink-0 border-r border-border bg-sidebar lg:block">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto px-6 py-8">
        <NavTree categories={categories} />
      </div>
    </aside>
  );
}
