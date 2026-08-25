import { PUBLIC_PATHS, resolveSiteUrl } from "@/lib/siteUrl";

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemap(siteUrl) {
  const lastmod = new Date().toISOString().slice(0, 10);

  const body = PUBLIC_PATHS.map((path) => {
    const loc = `${siteUrl}${path === "/" ? "/" : path}`;
    const priority = path === "/" ? "1.0" : "0.9";
    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

export async function getServerSideProps({ req, res }) {
  const siteUrl = resolveSiteUrl(req);
  if (!siteUrl) {
    res.statusCode = 500;
    res.end("Missing site URL");
    return { props: {} };
  }

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
  res.write(buildSitemap(siteUrl));
  res.end();
  return { props: {} };
}

export default function SitemapXml() {
  return null;
}
