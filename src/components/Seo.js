import Head from "next/head";
import { useSiteUrl } from "@/context/SiteUrlContext";
import {
  AUTHOR,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_TITLE,
  OG_IMAGE_PATH,
  SITE_NAME,
  THEME_COLOR,
  TWITTER_HANDLE,
  buildTitle,
  getSiteUrl,
  webAppJsonLd,
} from "@/lib/seo";

function joinUrl(base, path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!base) return normalized;
  return `${base.replace(/\/$/, "")}${normalized === "/" ? "" : normalized}`;
}

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = OG_IMAGE_PATH,
  noIndex = false,
  keywords = DEFAULT_KEYWORDS,
  jsonLd,
  children,
}) {
  const contextualSiteUrl = useSiteUrl();
  const siteUrl = contextualSiteUrl || getSiteUrl();
  const fullTitle = buildTitle(title);
  const canonical = joinUrl(siteUrl, path);
  const imageUrl = image.startsWith("http") ? image : joinUrl(siteUrl, image);
  const robots = noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large";

  const structuredData =
    jsonLd === null ? null : jsonLd ?? webAppJsonLd({ url: canonical, description });

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={AUTHOR} />
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <meta name="theme-color" content={THEME_COLOR} />
      <meta httpEquiv="content-language" content="en" />
      <link rel="canonical" href={canonical} />
      <link rel="icon" href="/logo.png" type="image/png" />
      <link rel="apple-touch-icon" href="/logo.png" />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={`${SITE_NAME} logo`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {siteUrl ? <meta property="og:image:secure_url" content={imageUrl} /> : null}

      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      ) : null}

      {children}
    </Head>
  );
}
