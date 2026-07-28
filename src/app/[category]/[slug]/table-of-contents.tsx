import type { TocEntry } from "@/lib/mdx";

export function TableOfContents({ toc }: { toc: TocEntry[] }) {
  if (toc.length === 0) return null;

  const minDepth = Math.min(...toc.map((entry) => entry.depth));

  return (
    <nav aria-label="Table of contents" className="hidden lg:block">
      <div className="sticky top-24 border-l border-border text-sm">
        <p className="mb-3 pl-4 font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          On this page
        </p>
        <ul className="space-y-2">
          {toc.map((entry) => (
            <li
              key={entry.id}
              style={{ paddingLeft: `${16 + (entry.depth - minDepth) * 12}px` }}
            >
              <a
                href={`#${entry.id}`}
                className="text-muted-foreground hover:text-primary"
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
