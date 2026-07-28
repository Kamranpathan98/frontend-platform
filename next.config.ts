import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // mermaid-isomorphic (and the playwright it drives) rely on
  // import.meta.resolve and native Node module resolution that webpack's
  // bundling breaks; keep them external so Server Components require()
  // them directly at runtime instead.
  serverExternalPackages: ["mermaid-isomorphic", "playwright"],
};

export default nextConfig;
