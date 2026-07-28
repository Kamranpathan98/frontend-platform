import { createMermaidRenderer } from "mermaid-isomorphic";

// mermaid-isomorphic manages its own Playwright browser instance and closes
// it when idle, so a module-level singleton is safe to reuse across every
// <Diagram> render within a single build (or dev) process instead of
// spinning up a fresh browser per diagram.
let renderer: ReturnType<typeof createMermaidRenderer> | undefined;

function getRenderer() {
  renderer ??= createMermaidRenderer();
  return renderer;
}

/**
 * Renders one Mermaid diagram to a static SVG string, entirely at
 * build/render time (architecture doc §8/§14: never client-side). Invalid
 * Mermaid syntax throws, so a broken diagram fails the build loudly instead
 * of silently rendering nothing.
 */
export async function renderMermaidDiagram(chart: string): Promise<string> {
  const render = getRenderer();
  const [result] = await render([chart]);

  if (result.status === "rejected") {
    const reason =
      result.reason instanceof Error
        ? result.reason.message
        : String(result.reason);
    throw new Error(`Invalid Mermaid diagram: ${reason}`);
  }

  return result.value.svg;
}
