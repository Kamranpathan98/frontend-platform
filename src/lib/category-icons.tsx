import {
  Binary,
  BookOpen,
  Braces,
  Layers,
  Network,
  Palette,
  type LucideIcon,
} from "lucide-react";

/**
 * Purely cosmetic per-category glyph for nav/cards -- falls back to a
 * generic icon for categories not in this list, so new content categories
 * never need a code change to render.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  javascript: Braces,
  react: Layers,
  "system-design": Network,
  css: Palette,
  "data-structures": Binary,
};

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? BookOpen;
}
