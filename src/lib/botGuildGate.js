import { getSessionFromReq } from "@/lib/auth";
import {
  botInviteUrlForGuild,
  fetchManageableGuilds,
  isBotInGuild,
} from "@/lib/guildCache";
import { getBotToken } from "@/lib/botToken";

/**
 * Ensure the request has a logged-in user who manages `guildId` and the bot is in that guild.
 * @returns {{ ok: true, session: object, guild: object, token: string } | { ok: false, status: number, error: string, inviteUrl?: string }}
 */
export async function assertUserCanUseBotInGuild(req, guildId) {
  const session = getSessionFromReq(req);
  if (!session?.accessToken || !session?.id) {
    return { ok: false, status: 401, error: "Not authenticated" };
  }

  const id = String(guildId || "").trim();
  if (!/^\d{17,20}$/.test(id)) {
    return { ok: false, status: 400, error: "Guild ID is required." };
  }

  const token = getBotToken();
  if (!token) {
    return { ok: false, status: 503, error: "Bot token is not configured." };
  }

  let guilds;
  try {
    const result = await fetchManageableGuilds(session.id, session.accessToken);
    guilds = result.guilds || [];
  } catch (error) {
    return {
      ok: false,
      status: error.status || 500,
      error: error.message || "Failed to verify guild access.",
    };
  }

  const guild = guilds.find((g) => String(g.id) === id);
  if (!guild) {
    return { ok: false, status: 403, error: "You do not manage this guild." };
  }

  const botInGuild = Boolean(guild.botInGuild) || (await isBotInGuild(id));
  if (!botInGuild) {
    return {
      ok: false,
      status: 403,
      error: "Bot is not in this guild.",
      inviteUrl: guild.inviteUrl || botInviteUrlForGuild(id),
    };
  }

  return { ok: true, session, guild, token };
}

/**
 * Confirm a channel exists, belongs to the guild, and is a sendable text channel.
 */
export async function assertChannelInGuild(token, guildId, channelId) {
  const chId = String(channelId || "").trim();
  if (!/^\d{17,20}$/.test(chId)) {
    return { ok: false, status: 400, error: "Channel ID is required." };
  }

  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${chId}`, {
      headers: { Authorization: `Bot ${token}`, Accept: "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: data.message || "Failed to resolve channel.",
      };
    }
    if (String(data.guild_id) !== String(guildId)) {
      return { ok: false, status: 403, error: "Channel is not in this guild." };
    }
    // Guild text (0) or announcement (5)
    if (data.type !== 0 && data.type !== 5) {
      return {
        ok: false,
        status: 400,
        error: "Channel must be a text or announcement channel.",
      };
    }
    return { ok: true, channel: data };
  } catch {
    return { ok: false, status: 500, error: "Failed to reach Discord." };
  }
}
