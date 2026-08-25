import { lookupWidgetEntity } from "../../lib/widgetData";
import { buildWidgetHtml } from "../../lib/widgetRender";

const REFRESH_MS = 60_000;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const type = String(req.query.type || "");
  const id = String(req.query.id || "").trim();
  const style = String(req.query.style || "card");
  const theme = String(req.query.theme || "signal");
  const accentRaw = String(req.query.accent || "").trim();
  const accent = accentRaw ? (accentRaw.startsWith("#") ? accentRaw : `#${accentRaw}`) : "";
  // Cache-buster / refresh token — clients append &t=<ms>
  const t = String(req.query.t || "").trim();

  if (!["user", "guild", "app"].includes(type) || !/^\d{17,20}$/.test(id)) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(400).send("<!DOCTYPE html><html><body>Invalid widget type or id</body></html>");
  }

  try {
    const result = await lookupWidgetEntity(type, id);
    if (result.error) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res
        .status(result.status || 404)
        .send(`<!DOCTYPE html><html><body>${result.error}</body></html>`);
    }

    const html = buildWidgetHtml(result.data, {
      style,
      theme,
      ...(accent ? { accent } : {}),
      standalone: true,
      refreshMs: REFRESH_MS,
      t,
    });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    // Short browser cache; `t` changes on refresh so clients get fresh profile data
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
    if (t) res.setHeader("X-Widget-Cache-Key", t);
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors *; default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none';"
    );
    return res.status(200).send(html);
  } catch (error) {
    console.error("Widget render error:", error);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(500).send("<!DOCTYPE html><html><body>Widget error</body></html>");
  }
}
