import Image from "next/image";

// Renders a pre-rendered Mermaid SVG (see scripts/render-diagrams.mjs) --
// a static image reference like <Figure>, not a build-time render. Sized
// and centered rather than stretched full-width since diagram aspect
// ratios vary far more than photos do.
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
