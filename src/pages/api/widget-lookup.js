import { lookupWidgetEntity } from "../../lib/widgetData";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, id } = req.body || {};
  if (!type || !id) {
    return res.status(400).json({ error: "type and id are required" });
  }

  try {
    const result = await lookupWidgetEntity(type, String(id).trim());
    if (result.error) {
      return res.status(result.status || 400).json({
        error: result.error,
        suggestedType: result.suggestedType || null,
      });
    }
    return res.status(200).json(result.data);
  } catch (error) {
    console.error("Widget lookup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
