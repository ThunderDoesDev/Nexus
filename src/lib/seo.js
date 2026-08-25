import { resolveSiteUrl } from "@/lib/siteUrl";

export const SITE_NAME = "Nexus";
export const SITE_TAGLINE = "Discord Dev Toolkit";
export const DEFAULT_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const DEFAULT_DESCRIPTION =
  "All-in-one Discord developer toolkit. Permissions, OAuth, embeds, snowflakes, user flags, mentions, CDN URLs, and more.";
export const DEFAULT_KEYWORDS =
  "discord, bot, permissions, calculator, oauth, embed, webhook, snowflake, flags, mentions, nexus, discord toolkit, discord developer tools";
export const THEME_COLOR = "#0d9488";
export const AUTHOR = "ThunderDoesDev";
export const AUTHOR_URL = "https://thunderdoesdev.gg";
export const TWITTER_HANDLE = "@thunderdoesdev";
export const OG_IMAGE_PATH = "/logo.png";

/** Public site origin without trailing slash. Set NEXT_PUBLIC_SITE_URL in production. */
export function getSiteUrl() {
  return resolveSiteUrl();
}

export function absoluteUrl(path = "/") {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!base) return normalized;
  return `${base}${normalized === "/" ? "" : normalized}`;
}

export function buildTitle(pageTitle) {
  if (!pageTitle || pageTitle === DEFAULT_TITLE) return DEFAULT_TITLE;
  if (pageTitle.includes(SITE_NAME)) return pageTitle;
  return `${pageTitle} — ${SITE_NAME}`;
}

export function webAppJsonLd({ url, description = DEFAULT_DESCRIPTION } = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    alternateName: DEFAULT_TITLE,
    description,
    url: url || absoluteUrl("/") || undefined,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: AUTHOR,
      url: AUTHOR_URL,
    },
    publisher: {
      "@type": "Person",
      name: AUTHOR,
      url: AUTHOR_URL,
    },
  };
}

export const PAGE_SEO = {
  home: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: "/",
  },
  tools: {
    title: "All Discord Tools",
    description:
      "Browse every Nexus Discord utility — permissions, embeds, lookups, CDN assets, AutoMod, and more in one catalog.",
    path: "/tools",
  },
  dashboard: {
    title: "Dashboard",
    description: "Manage your Discord servers connected to Nexus and open bot-powered tools.",
    path: "/dashboard",
    noIndex: true,
  },
  notFound: {
    title: "Page not found",
    description: "This page does not exist. Return to the Nexus Discord developer toolkit.",
    path: "/404",
    noIndex: true,
  },
};
