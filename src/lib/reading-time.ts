const WORDS_PER_MINUTE = 200;

/** Rough estimate from the raw MDX body -- a derived value, not tracked data. */
export function estimateReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
