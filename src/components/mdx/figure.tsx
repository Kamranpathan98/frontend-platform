import Image from "next/image";

export function Figure({
  src,
  alt,
  caption,
  width = 800,
  height = 450,
}: {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}) {
  return (
    <figure className="my-6">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        className="border-border w-full rounded-lg border"
      />
      {caption ? (
        <figcaption className="text-muted-foreground mt-2 text-center text-sm">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
