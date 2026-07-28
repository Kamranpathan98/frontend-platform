import { renderMermaidDiagram } from "@/lib/mermaid";

export async function Diagram({ chart }: { chart: string }) {
  const svg = await renderMermaidDiagram(chart);

  return (
    <figure
      className="border-border my-6 overflow-x-auto rounded-lg border p-4 [&_svg]:mx-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
