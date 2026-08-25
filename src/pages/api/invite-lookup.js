import { parseInviteCode, formatInvite } from "../../lib/invites";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { invite } = req.body || {};
  const code = parseInviteCode(invite);

  if (!code) {
    return res.status(400).json({ error: "Enter a valid invite code or discord.gg link." });
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true&with_expiration=true`,
      { headers: { Accept: "application/json" } }
    );

    if (response.status === 404) {
      return res.status(404).json({ error: "Invite not found or has expired." });
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return res.status(response.status).json({
        error: text || `Discord returned ${response.status}`,
      });
    }

    const data = await response.json();
    return res.status(200).json(formatInvite(data));
  } catch (error) {
    console.error("Invite lookup failed:", error);
    return res.status(500).json({ error: "Failed to look up invite." });
  }
}
