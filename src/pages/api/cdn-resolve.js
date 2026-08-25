import { resolveCdnAsset } from "../../lib/cdnResolve";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { kindId, ...input } = req.body || {};
  if (!kindId) {
    return res.status(400).json({ error: "kindId is required" });
  }

  try {
    const result = await resolveCdnAsset(kindId, input);
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    return res.status(200).json(result.data);
  } catch (error) {
    console.error("CDN resolve error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
