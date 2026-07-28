import { Callout } from "./callout";
import { Figure } from "./figure";

/**
 * The closed set of components lessons may use (architecture doc §8).
 * `<Diagram>` (Mermaid) and `<Playground>` (Sandpack) arrive in later
 * milestones (M7B, M11) and get added here when they do -- this object is
 * the single source of truth for both the runtime component map and the
 * compile-time whitelist check in src/lib/mdx.ts.
 */
export const mdxComponents = {
  Callout,
  Figure,
} as const;

export type MdxComponents = typeof mdxComponents;

export const mdxComponentNames: readonly string[] = Object.keys(mdxComponents);
