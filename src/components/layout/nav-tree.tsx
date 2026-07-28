import type { CategoryNav } from "@/lib/content";
import { getCategoryIcon } from "@/lib/category-icons";
import { NavLink } from "./nav-link";

export function NavTree({
  categories,
  onNavigate,
}: {
  categories: CategoryNav[];
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Lessons" className="space-y-6 text-sm">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.category);
        return (
          <div key={category.category}>
            <NavLink
              href={`/${category.category}`}
              onNavigate={onNavigate}
              className="flex items-center gap-2 border-l-0 pl-0 font-semibold capitalize"
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {category.category.replace(/-/g, " ")}
            </NavLink>
            <ul className="mt-2 space-y-0.5">
              {category.lessons.map((lesson) => (
                <li key={lesson.slug}>
                  <NavLink
                    href={`/${category.category}/${lesson.slug}`}
                    onNavigate={onNavigate}
                  >
                    {lesson.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
