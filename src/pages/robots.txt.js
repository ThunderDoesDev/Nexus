import { PUBLIC_PATHS, resolveSiteUrl } from "@/lib/siteUrl";

function buildRobotsTxt(siteUrl) {
  const lines = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /dashboard",
    "",
  ];
  if (siteUrl) {
    lines.push(`Sitemap: ${siteUrl}/sitemap.xml`, "");
  }
  return lines.join("\n");
}

export async function getServerSideProps({ req, res }) {
  const siteUrl = resolveSiteUrl(req);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
  res.write(buildRobotsTxt(siteUrl));
  res.end();
  return { props: {} };
}

export default function RobotsTxt() {
  return null;
}
