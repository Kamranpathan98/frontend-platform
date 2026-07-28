import type { ComponentType } from "react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { visit } from "unist-util-visit";
import type { Node } from "unist";
import type { Root } from "mdast";
import type { VFile } from "vfile";

import { mdxComponentNames, type MdxComponents } from "@/components/mdx";

type MdxJsxElementNode = {
  type: "mdxJsxFlowElement" | "mdxJsxTextElement";
  name?: string | null;
};

function isMdxJsxElement(node: unknown): node is MdxJsxElementNode {
  return (
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    ((node as { type: unknown }).type === "mdxJsxFlowElement" ||
      (node as { type: unknown }).type === "mdxJsxTextElement")
  );
}

/**
 * Enforces the closed component whitelist (architecture doc §8: "anything
 * not on the list doesn't exist for content") at compile time. An unknown
 * capitalized JSX tag fails the compile with a clear message naming the
 * tag, instead of surfacing as an opaque "undefined component" error deep
 * in React's renderer.
 */
function remarkEnforceComponentWhitelist() {
  return (tree: Root, file: VFile) => {
    visit(tree, (node) => {
      if (!isMdxJsxElement(node)) return;
      const name = node.name;
      if (name && /^[A-Z]/.test(name) && !mdxComponentNames.includes(name)) {
        file.fail(
          `<${name}> is not on the MDX component whitelist (allowed: ${mdxComponentNames.join(", ")}).`,
          node as unknown as Node,
        );
      }
    });
  };
}

const prettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark" },
};

export type LessonContent = ComponentType<{ components?: MdxComponents }>;

/**
 * Compiles a lesson's raw MDX body (already stripped of frontmatter by
 * lib/content.ts) into a renderable React component. Runs entirely at
 * build/render time on the server -- MDX is never compiled in the browser
 * and never fetched at runtime (architecture doc §8).
 */
export async function compileLessonBody(body: string): Promise<LessonContent> {
  const { default: Content } = await evaluate(body, {
    ...runtime,
    remarkPlugins: [remarkGfm, remarkEnforceComponentWhitelist],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [rehypePrettyCode, prettyCodeOptions],
    ],
  });
  return Content as unknown as LessonContent;
}
