/** Shared public path list for sitemap/robots. */
export const PUBLIC_PATHS = ["/", "/tools"];

/**
 * Resolve the public site origin (no trailing slash).
 * Prefer NEXT_PUBLIC_SITE_URL; fall back to the request host or window origin.
 */
export function resolveSiteUrl(req) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (req?.headers?.host) {
    const host = req.headers.host;
    const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
    const proto = req.headers["x-forwarded-proto"] || (isLocal ? "http" : "https");
    return `${proto}://${host}`.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "";
}
