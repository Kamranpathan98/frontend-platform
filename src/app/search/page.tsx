import type { Metadata } from "next";

import { SearchBox } from "@/components/search/search-box";

export const metadata: Metadata = {
  title: "Search",
  description: "Search all published lessons.",
};

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold">Search</h1>
      <div className="mt-8">
        <SearchBox />
      </div>
    </main>
  );
}
