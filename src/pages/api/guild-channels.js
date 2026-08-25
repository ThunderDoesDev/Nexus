import { assertUserCanUseBotInGuild } from "@/lib/botGuildGate";

const DEFAULT_SENDABLE = new Set([0, 5]); // GUILD_TEXT, GUILD_ANNOUNCEMENT

function parseTypes(raw) {
  if (!raw || typeof raw !== "string") return null;
  const types = raw
    .split(",")
    .map((t) => Number(t.trim()))
    .filter((n) => Number.isInteger(n) && n >= 0);
  return types.length ? new Set(types) : null;
}

function sortChannels(channels, allowedTypes) {
  const categories = new Map();
  for (const ch of channels) {
    if (ch.type === 4) categories.set(ch.id, ch);
  }

  return channels
    .filter((ch) => allowedTypes.has(ch.type))
    .sort((a, b) => {
      const catA = a.parent_id ? (categories.get(a.parent_id)?.position ?? -1) : -1;
      const catB = b.parent_id ? (categories.get(b.parent_id)?.position ?? -1) : -1;
      if (catA !== catB) return catA - catB;
      return (a.position ?? 0) - (b.position ?? 0);
    })
    .map((ch) => ({
      id: ch.id,
      name: ch.name,
      type: ch.type,
      parentId: ch.parent_id || null,
      parentName: ch.parent_id ? categories.get(ch.parent_id)?.name || null : null,
    }));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const guildId = String(req.query.guildId || "").trim();
  const gate = await assertUserCanUseBotInGuild(req, guildId);
  if (!gate.ok) {
    return res.status(gate.status).json({
      error: gate.error,
      ...(gate.inviteUrl && { inviteUrl: gate.inviteUrl }),
      channels: [],
    });
  }

  const allowedTypes = parseTypes(req.query.types) || DEFAULT_SENDABLE;

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/channels`,
      {
        headers: {
          Authorization: `Bot ${gate.token}`,
          Accept: "application/json",
        },
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || "Failed to fetch channels.",
        channels: [],
      });
    }

    const channels = sortChannels(Array.isArray(data) ? data : [], allowedTypes);
    res.setHeader("Cache-Control", "private, max-age=30");
    return res.status(200).json({ channels });
  } catch {
    return res.status(500).json({ error: "Failed to reach Discord.", channels: [] });
  }
}
