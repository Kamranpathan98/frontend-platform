import type { CategoryNav } from "@/lib/content";
import { NavTree } from "./nav-tree";

export function Sidebar({ categories }: { categories: CategoryNav[] }) {
  if (categories.length === 0) return null;

  return (
    <aside className="border-border hidden w-64 shrink-0 border-r lg:block">
      <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto px-4 py-6">
        <NavTree categories={categories} />
      </div>
    </aside>
  );
}
