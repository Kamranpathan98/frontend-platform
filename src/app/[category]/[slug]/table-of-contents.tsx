import type { TocEntry } from "@/lib/mdx";

export function TableOfContents({ toc }: { toc: TocEntry[] }) {
  if (toc.length === 0) return null;

  const minDepth = Math.min(...toc.map((entry) => entry.depth));

  return (
    <nav aria-label="Table of contents" className="hidden lg:block">
      <div className="sticky top-20 text-sm">
        <p className="text-foreground mb-3 font-semibold">On this page</p>
        <ul className="space-y-2">
          {toc.map((entry) => (
            <li
              key={entry.id}
              style={{ marginLeft: `${(entry.depth - minDepth) * 12}px` }}
            >
              <a
                href={`#${entry.id}`}
                className="text-muted-foreground hover:text-foreground"
              >
                {entry.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
