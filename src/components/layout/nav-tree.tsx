import type { CategoryNav } from "@/lib/content";
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
      {categories.map((category) => (
        <div key={category.category}>
          <NavLink
            href={`/${category.category}`}
            onNavigate={onNavigate}
            className="font-semibold capitalize"
          >
            {category.category}
          </NavLink>
          <ul className="border-border mt-2 space-y-1.5 border-l pl-3">
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
      ))}
    </nav>
  );
}
