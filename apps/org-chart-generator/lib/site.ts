/**
 * Canonical origin for metadata, structured data and the sitemap. Set
 * NEXT_PUBLIC_SITE_URL once you have a custom domain; on Vercel the project's
 * production URL is picked up automatically.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Org Chart Generator";

export const SITE_TAGLINE = "Build an org chart from a plain text file";

export const SITE_DESCRIPTION =
  "A free org chart generator: describe your team in a small text file and get a clean organizational chart you can export to SVG, PNG or PDF. No account, no drag and drop — add photos, contact details, colours and LinkedIn links, and see the chart update as you type.";
