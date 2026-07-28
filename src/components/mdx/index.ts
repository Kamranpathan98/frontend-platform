import { Callout } from "./callout";
import { Diagram } from "./diagram";
import { Figure } from "./figure";

/**
 * The closed set of components lessons may use (architecture doc §8).
 * `<Playground>` (Sandpack) arrives in M11 and gets added here when it does
 * -- this object is the single source of truth for both the runtime
 * component map and the compile-time whitelist check in src/lib/mdx.ts.
 */
export const mdxComponents = {
  Callout,
  Diagram,
  Figure,
} as const;

export type MdxComponents = typeof mdxComponents;

export const mdxComponentNames: readonly string[] = Object.keys(mdxComponents);
