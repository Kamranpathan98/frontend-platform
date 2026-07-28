/**
 * Single source of truth for the production origin -- used for absolute
 * URLs in the sitemap, RSS feed, JSON-LD, and metadataBase. Hardcoded
 * rather than an environment variable per the standing "no environment
 * variables or secrets" rule (architecture doc §13, established in M2).
 */
export const SITE_URL = "https://frontend-platform-ten.vercel.app";
