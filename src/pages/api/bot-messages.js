import {
  assertChannelInGuild,
  assertUserCanUseBotInGuild,
} from "@/lib/botGuildGate";

async function discordJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function gateRequest(req, { guildId, channelId }) {
  const gate = await assertUserCanUseBotInGuild(req, guildId);
  if (!gate.ok) {
    return {
      ok: false,
      status: gate.status,
      body: {
        error: gate.error,
        ...(gate.inviteUrl && { inviteUrl: gate.inviteUrl }),
      },
    };
  }

  const channelGate = await assertChannelInGuild(gate.token, guildId, channelId);
  if (!channelGate.ok) {
    return {
      ok: false,
      status: channelGate.status,
      body: { error: channelGate.error },
    };
  }

  return { ok: true, token: gate.token, channelId: String(channelId).trim() };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const guildId = req.query.guildId;
    const channelId = req.query.channelId;
    const messageId = String(req.query.messageId || "").trim();

    if (!/^\d{17,20}$/.test(messageId)) {
      return res.status(400).json({ error: "Message ID is required." });
    }

    const gated = await gateRequest(req, { guildId, channelId });
    if (!gated.ok) return res.status(gated.status).json(gated.body);

    try {
      const response = await fetch(
        `https://discord.com/api/v10/channels/${gated.channelId}/messages/${messageId}`,
        {
          headers: {
            Authorization: `Bot ${gated.token}`,
            Accept: "application/json",
          },
        }
      );
      const data = await discordJson(response);
      if (!response.ok) {
        return res
          .status(response.status)
          .json({ error: data.message || "Failed to fetch message." });
      }
      return res.status(200).json(data);
    } catch {
      return res.status(500).json({ error: "Failed to reach Discord." });
    }
  }

  if (req.method === "POST") {
    const { guildId, channelId, payload } = req.body ?? {};
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Payload is required." });
    }

    const gated = await gateRequest(req, { guildId, channelId });
    if (!gated.ok) return res.status(gated.status).json(gated.body);

    try {
      const response = await fetch(
        `https://discord.com/api/v10/channels/${gated.channelId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bot ${gated.token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await discordJson(response);
      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || "Failed to send message.",
          code: data.code,
        });
      }
      return res.status(200).json(data);
    } catch {
      return res.status(500).json({ error: "Failed to reach Discord." });
    }
  }

  if (req.method === "PATCH") {
    const { guildId, channelId, messageId, payload } = req.body ?? {};
    if (!/^\d{17,20}$/.test(String(messageId || "").trim())) {
      return res.status(400).json({ error: "Message ID is required." });
    }
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Payload is required." });
    }

    const gated = await gateRequest(req, { guildId, channelId });
    if (!gated.ok) return res.status(gated.status).json(gated.body);

    try {
      const response = await fetch(
        `https://discord.com/api/v10/channels/${gated.channelId}/messages/${String(messageId).trim()}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bot ${gated.token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await discordJson(response);
      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || "Failed to update message.",
          code: data.code,
        });
      }
      return res.status(200).json(data);
    } catch {
      return res.status(500).json({ error: "Failed to reach Discord." });
    }
  }

  if (req.method === "DELETE") {
    const { guildId, channelId, messageId } = req.body ?? {};
    if (!/^\d{17,20}$/.test(String(messageId || "").trim())) {
      return res.status(400).json({ error: "Message ID is required." });
    }

    const gated = await gateRequest(req, { guildId, channelId });
    if (!gated.ok) return res.status(gated.status).json(gated.body);

    try {
      const response = await fetch(
        `https://discord.com/api/v10/channels/${gated.channelId}/messages/${String(messageId).trim()}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bot ${gated.token}`,
            Accept: "application/json",
          },
        }
      );
      if (!response.ok) {
        const data = await discordJson(response);
        return res
          .status(response.status)
          .json({ error: data.message || "Failed to delete message." });
      }
      return res.status(200).json({ ok: true });
    } catch {
      return res.status(500).json({ error: "Failed to reach Discord." });
    }
  }

  res.setHeader("Allow", "GET, POST, PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed." });
}
