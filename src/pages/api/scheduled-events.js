import { assertUserCanUseBotInGuild } from "@/lib/botGuildGate";

async function discordJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export default async function handler(req, res) {
  const guildId = String(
    (req.method === "GET" ? req.query.guildId : req.body?.guildId) || ""
  ).trim();

  const gate = await assertUserCanUseBotInGuild(req, guildId);
  if (!gate.ok) {
    return res.status(gate.status).json({
      error: gate.error,
      ...(gate.inviteUrl && { inviteUrl: gate.inviteUrl }),
    });
  }

  const base = `https://discord.com/api/v10/guilds/${guildId}/scheduled-events`;

  if (req.method === "GET") {
    try {
      const response = await fetch(`${base}?with_user_count=true`, {
        headers: {
          Authorization: `Bot ${gate.token}`,
          Accept: "application/json",
        },
      });
      const data = await discordJson(response);
      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || "Failed to list scheduled events.",
          events: [],
        });
      }
      return res.status(200).json({ events: Array.isArray(data) ? data : [] });
    } catch {
      return res.status(500).json({ error: "Failed to reach Discord.", events: [] });
    }
  }

  if (req.method === "POST") {
    const payload = req.body?.payload;
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Event payload is required." });
    }
    try {
      const response = await fetch(base, {
        method: "POST",
        headers: {
          Authorization: `Bot ${gate.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await discordJson(response);
      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || "Failed to create scheduled event.",
          code: data.code,
        });
      }
      return res.status(200).json(data);
    } catch {
      return res.status(500).json({ error: "Failed to reach Discord." });
    }
  }

  if (req.method === "DELETE") {
    const eventId = String(req.body?.eventId || "").trim();
    if (!/^\d{17,20}$/.test(eventId)) {
      return res.status(400).json({ error: "Event ID is required." });
    }
    try {
      const response = await fetch(`${base}/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bot ${gate.token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        const data = await discordJson(response);
        return res.status(response.status).json({
          error: data.message || "Failed to delete scheduled event.",
        });
      }
      return res.status(200).json({ ok: true });
    } catch {
      return res.status(500).json({ error: "Failed to reach Discord." });
    }
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ error: "Method not allowed." });
}
