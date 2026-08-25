import { parseVanityCode, formatVanityCheck } from "../../lib/vanity";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { vanity, code: codeBody } = req.body || {};
  const code = parseVanityCode(vanity ?? codeBody);

  if (!code) {
    return res.status(400).json({ error: "Enter a valid vanity code or discord.gg link." });
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true&with_expiration=true`,
      { headers: { Accept: "application/json" } }
    );

    if (response.status === 404) {
      return res.status(200).json(formatVanityCheck(null, code));
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return res.status(response.status).json({
        error: text || `Discord returned ${response.status}`,
      });
    }

    const data = await response.json();
    return res.status(200).json(formatVanityCheck(data, code));
  } catch (error) {
    console.error("Vanity check failed:", error);
    return res.status(500).json({ error: "Failed to check vanity URL." });
  }
}
