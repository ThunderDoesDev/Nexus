import config from "@/settings/config.json";
import { getSessionFromReq } from "@/lib/auth";
import { assertUserCanUseBotInGuild } from "@/lib/botGuildGate";
import { getBotToken } from "@/lib/botToken";

async function discordJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function applicationId() {
  return String(config.clientId || "").trim();
}

function commandsUrl(appId, guildId) {
  if (guildId) {
    return `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`;
  }
  return `https://discord.com/api/v10/applications/${appId}/commands`;
}

async function requireAuth(req) {
  const session = getSessionFromReq(req);
  if (!session?.accessToken || !session?.id) {
    return { ok: false, status: 401, error: "Not authenticated" };
  }
  const token = getBotToken();
  if (!token) {
    return { ok: false, status: 503, error: "Bot token is not configured." };
  }
  const appId = applicationId();
  if (!appId) {
    return { ok: false, status: 503, error: "Application client ID is not configured." };
  }
  return { ok: true, session, token, appId };
}

export default async function handler(req, res) {
  const guildId = String(
    (req.method === "GET" ? req.query.guildId : req.body?.guildId) || ""
  ).trim();

  if (guildId) {
    const gate = await assertUserCanUseBotInGuild(req, guildId);
    if (!gate.ok) {
      return res.status(gate.status).json({
        error: gate.error,
        ...(gate.inviteUrl && { inviteUrl: gate.inviteUrl }),
      });
    }
  } else {
    // Global commands: require login only (bot token owns the app)
    const auth = await requireAuth(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.error });
    }
  }

  const auth = await requireAuth(req);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const url = commandsUrl(auth.appId, guildId || null);

  if (req.method === "GET") {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bot ${auth.token}`,
          Accept: "application/json",
        },
      });
      const data = await discordJson(response);
      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || "Failed to list commands.",
          commands: [],
        });
      }
      return res.status(200).json({ commands: Array.isArray(data) ? data : [] });
    } catch {
      return res.status(500).json({ error: "Failed to reach Discord.", commands: [] });
    }
  }

  if (req.method === "POST") {
    const payload = req.body?.payload;
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Command payload is required." });
    }
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bot ${auth.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await discordJson(response);
      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || "Failed to create command.",
          code: data.code,
          errors: data.errors,
        });
      }
      return res.status(200).json(data);
    } catch {
      return res.status(500).json({ error: "Failed to reach Discord." });
    }
  }

  if (req.method === "PUT") {
    // Bulk overwrite
    const commands = req.body?.commands;
    if (!Array.isArray(commands)) {
      return res.status(400).json({ error: "commands array is required." });
    }
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bot ${auth.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(commands),
      });
      const data = await discordJson(response);
      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || "Failed to overwrite commands.",
          code: data.code,
        });
      }
      return res.status(200).json({ commands: Array.isArray(data) ? data : [] });
    } catch {
      return res.status(500).json({ error: "Failed to reach Discord." });
    }
  }

  if (req.method === "DELETE") {
    const commandId = String(req.body?.commandId || "").trim();
    if (!/^\d{17,20}$/.test(commandId)) {
      return res.status(400).json({ error: "Command ID is required." });
    }
    try {
      const response = await fetch(`${url}/${commandId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bot ${auth.token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        const data = await discordJson(response);
        return res.status(response.status).json({
          error: data.message || "Failed to delete command.",
        });
      }
      return res.status(200).json({ ok: true });
    } catch {
      return res.status(500).json({ error: "Failed to reach Discord." });
    }
  }

  res.setHeader("Allow", "GET, POST, PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed." });
}
