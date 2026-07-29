import Image from "next/image";

// Renders a pre-rendered SVG -- a static image reference like <Figure>,
// not a build-time render. Sized and centered rather than stretched
// full-width since diagram aspect ratios vary far more than photos do.
// The SVG itself comes from one of two sources: Mermaid, rendered via
// scripts/render-diagrams.mjs (structural/flowchart diagrams), or a
// hand-authored SVG with embedded SMIL/CSS animation (sequential/temporal
// processes worth showing as motion -- see .ai/prompts/diagram.md). Both
// are just static files to this component; it doesn't know or care which
// produced them.
export function Diagram({
  src,
  alt,
  caption,
  width = 700,
  height = 500,
}: {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}) {
  return (
    <figure className="my-6 flex flex-col items-center">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        className="border-border max-w-full rounded-lg border p-2"
      />
      {caption ? (
        <figcaption className="text-muted-foreground mt-2 text-center text-sm">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
