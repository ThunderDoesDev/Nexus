/** Shared public path list for sitemap/robots. */
export const PUBLIC_PATHS = ["/", "/tools"];

/** Public production origin. Discord embeds require this to match the posted URL. */
export const DEFAULT_SITE_URL = "https://nexus.aeraxis.dev";

function firstHeader(value) {
  if (!value) return "";
  return String(Array.isArray(value) ? value[0] : value).split(",")[0].trim();
}

function isLocalHost(host) {
  return (
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("[::1]")
  );
}

/**
 * Resolve the public site origin (no trailing slash).
 * Prefer the incoming request host so crawlers see og:url/og:image on the same origin
 * as the posted link, then NEXT_PUBLIC_SITE_URL, then the production default.
 */
export function resolveSiteUrl(req) {
  if (req?.headers) {
    const host = firstHeader(req.headers["x-forwarded-host"] || req.headers.host);
    if (host && !isLocalHost(host)) {
      const proto = firstHeader(req.headers["x-forwarded-proto"]) || "https";
      return `${proto}://${host}`.replace(/\/$/, "");
    }
    if (host && isLocalHost(host)) {
      const proto = firstHeader(req.headers["x-forwarded-proto"]) || "http";
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  }

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return DEFAULT_SITE_URL;
}
