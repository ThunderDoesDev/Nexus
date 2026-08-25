import { parseTemplateCode, formatTemplate } from "../../lib/templates";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { template } = req.body || {};
  const code = parseTemplateCode(template);

  if (!code) {
    return res.status(400).json({
      error: "Enter a valid template code or discord.new / discord.com/template link.",
    });
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/templates/${encodeURIComponent(code)}`,
      { headers: { Accept: "application/json" } }
    );

    if (response.status === 404) {
      return res.status(404).json({ error: "Template not found." });
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return res.status(response.status).json({
        error: text || `Discord returned ${response.status}`,
      });
    }

    const data = await response.json();
    return res.status(200).json(formatTemplate(data));
  } catch (error) {
    console.error("Template lookup failed:", error);
    return res.status(500).json({ error: "Failed to look up template." });
  }
}
