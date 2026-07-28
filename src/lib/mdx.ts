import type { ComponentType } from "react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { visit } from "unist-util-visit";
import { toString as hastToString } from "hast-util-to-string";
import type { Node } from "unist";
import type { Root as MdastRoot } from "mdast";
import type { Root as HastRoot } from "hast";
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
  return (tree: MdastRoot, file: VFile) => {
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

export type TocEntry = { depth: number; text: string; id: string };

const HEADING_TAG_PATTERN = /^h([1-6])$/;

/**
 * Collects {depth, text, id} for every heading into `toc`, run after
 * rehype-slug has assigned ids but before rehype-autolink-headings wraps
 * heading children in an anchor (so text extraction stays simple).
 */
function rehypeExtractToc(toc: TocEntry[]) {
  return (tree: HastRoot) => {
    visit(tree, "element", (node) => {
      const match = HEADING_TAG_PATTERN.exec(node.tagName);
      if (!match) return;
      const id =
        typeof node.properties.id === "string" ? node.properties.id : "";
      if (!id) return;
      toc.push({ depth: Number(match[1]), text: hastToString(node), id });
    });
  };
}

const prettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark" },
};

export type LessonContent = ComponentType<{ components?: MdxComponents }>;

/**
 * Compiles a lesson's raw MDX body (already stripped of frontmatter by
 * lib/content.ts) into a renderable React component, plus a table of
 * contents derived from the same compiled heading tree (so ToC links are
 * guaranteed to match the ids rehype-slug actually assigned). Runs entirely
 * at build/render time on the server -- MDX is never compiled in the
 * browser and never fetched at runtime (architecture doc §8).
 */
export async function compileLessonBody(
  body: string,
): Promise<{ Content: LessonContent; toc: TocEntry[] }> {
  const toc: TocEntry[] = [];
  const { default: Content } = await evaluate(body, {
    ...runtime,
    remarkPlugins: [remarkGfm, remarkEnforceComponentWhitelist],
    rehypePlugins: [
      rehypeSlug,
      [rehypeExtractToc, toc],
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [rehypePrettyCode, prettyCodeOptions],
    ],
  });
  return { Content: Content as unknown as LessonContent, toc };
}
