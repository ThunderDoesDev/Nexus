/**
 * Nexus presence gateway — Discord Gateway client using your bot token.
 * Requires Presence Intent + Server Members Intent.
 * The bot must share a server with users you want to track.
 *
 * npm run presence
 * http://127.0.0.1:4001/v1/users/:id
 */

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  Client,
  GatewayIntentBits,
  ActivityType,
  Partials,
} from "discord.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const PORT = Number(process.env.PRESENCE_PORT || process.env.LANYARD_PORT || 4001);

function loadToken() {
  if (process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN) {
    return String(process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN).trim();
  }
  try {
    const config = JSON.parse(
      fs.readFileSync(path.join(root, "settings", "config.json"), "utf8")
    );
    return String(config.token || config.DISCORD_BOT_TOKEN || "").trim();
  } catch {
    return "";
  }
}

const token = loadToken();
if (!token) {
  console.error("Missing bot token in settings/config.json");
  process.exit(1);
}

/** @type {Map<string, object>} */
const presenceByUser = new Map();

function activityTypeNumber(type) {
  if (typeof type === "number") return type;
  if (type === ActivityType.Playing) return 0;
  if (type === ActivityType.Streaming) return 1;
  if (type === ActivityType.Listening) return 2;
  if (type === ActivityType.Watching) return 3;
  if (type === ActivityType.Custom) return 4;
  if (type === ActivityType.Competing) return 5;
  return 0;
}

function serializeActivity(activity) {
  const payload = {
    id: activity.id || undefined,
    name: activity.name || "",
    type: activityTypeNumber(activity.type),
    url: activity.url || null,
    created_at: activity.createdTimestamp || Date.now(),
    timestamps: activity.timestamps
      ? {
          start: activity.timestamps.start?.getTime?.() ?? activity.timestamps.start ?? undefined,
          end: activity.timestamps.end?.getTime?.() ?? activity.timestamps.end ?? undefined,
        }
      : undefined,
    application_id: activity.applicationId || undefined,
    details: activity.details || null,
    state: activity.state || null,
    emoji: activity.emoji
      ? {
          name: activity.emoji.name || null,
          id: activity.emoji.id || undefined,
          animated: Boolean(activity.emoji.animated),
        }
      : undefined,
    assets: activity.assets
      ? {
          large_image: activity.assets.largeImage || undefined,
          large_text: activity.assets.largeText || undefined,
          small_image: activity.assets.smallImage || undefined,
          small_text: activity.assets.smallText || undefined,
        }
      : undefined,
    sync_id: activity.syncId || undefined,
  };
  return JSON.parse(JSON.stringify(payload));
}

function serializeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    discriminator: user.discriminator || "0",
    bot: Boolean(user.bot),
    global_name: user.globalName || null,
    public_flags: user.flags?.bitfield ?? user.publicFlags?.bitfield ?? 0,
  };
}

function spotifyFromActivities(activities) {
  const spotify = activities.find(
    (a) => a.name === "Spotify" && activityTypeNumber(a.type) === 2 && a.syncId
  );
  if (!spotify) return null;
  const large = spotify.assets?.largeImage || "";
  return {
    track_id: spotify.syncId,
    timestamps: spotify.timestamps || {},
    song: spotify.details || null,
    artist: (spotify.state || "").replace(/;/g, ", "),
    album_art_url: large.startsWith("spotify:")
      ? `https://i.scdn.co/image/${large.slice("spotify:".length)}`
      : null,
    album: spotify.assets?.largeText || null,
  };
}

function storePresence(presence) {
  if (!presence?.userId) return;
  const user = presence.user || presence.member?.user;
  const activities = [...(presence.activities || [])].map(serializeActivity);
  const spotify = spotifyFromActivities(presence.activities || []);
  const clientStatus = presence.clientStatus || {};

  presenceByUser.set(presence.userId, {
    discord_user: serializeUser(user) || { id: presence.userId },
    discord_status: presence.status || "offline",
    activities,
    spotify,
    listening_to_spotify: Boolean(spotify),
    active_on_discord_desktop: Boolean(clientStatus.desktop),
    active_on_discord_mobile: Boolean(clientStatus.mobile),
    active_on_discord_web: Boolean(clientStatus.web),
    active_on_discord_embedded: Boolean(clientStatus.embedded),
  });
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.User, Partials.GuildMember],
});

client.once("clientReady", () => {
  let count = 0;
  for (const guild of client.guilds.cache.values()) {
    for (const presence of guild.presences.cache.values()) {
      storePresence(presence);
      count += 1;
    }
  }
  console.log(`[presence] Logged in as ${client.user.tag}`);
  console.log(`[presence] Cached ${count} presences across ${client.guilds.cache.size} guilds`);
  console.log(`[presence] API → http://127.0.0.1:${PORT}/v1/users/:id`);
  console.log(
    `[presence] Invite → https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=0`
  );
});

client.on("presenceUpdate", (_oldPresence, newPresence) => {
  storePresence(newPresence);
});

client.on("error", (err) => {
  console.error("[presence] Discord error:", err.message);
});

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    });
    res.end();
    return;
  }

  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);

  if (url.pathname === "/health" || url.pathname === "/v1/health") {
    sendJson(res, 200, {
      ok: true,
      users: presenceByUser.size,
      guilds: client.guilds.cache.size,
      ready: Boolean(client.isReady()),
      bot: client.user
        ? { id: client.user.id, username: client.user.username }
        : null,
    });
    return;
  }

  const match = url.pathname.match(/^\/v1\/users\/(\d{17,20})$/);
  if (req.method === "GET" && match) {
    const userId = match[1];
    let data = presenceByUser.get(userId);

    if (!data) {
      for (const guild of client.guilds.cache.values()) {
        const member = guild.members.cache.get(userId);
        if (member?.presence) {
          storePresence(member.presence);
          data = presenceByUser.get(userId);
          break;
        }
      }
    }

    if (!data) {
      try {
        const user = await client.users.fetch(userId);
        data = {
          discord_user: serializeUser(user),
          discord_status: "offline",
          activities: [],
          spotify: null,
          listening_to_spotify: false,
          active_on_discord_desktop: false,
          active_on_discord_mobile: false,
          active_on_discord_web: false,
          active_on_discord_embedded: false,
        };
      } catch {
        sendJson(res, 404, {
          success: false,
          error: {
            code: "user_not_monitored",
            message:
              "User not found in presence cache. Invite the bot to a mutual server.",
          },
        });
        return;
      }
    }

    sendJson(res, 200, { success: true, data });
    return;
  }

  sendJson(res, 404, { success: false, error: { code: "not_found", message: "Not found" } });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[presence] HTTP listening on 127.0.0.1:${PORT}`);
});

client.login(token).catch((err) => {
  console.error("[presence] Login failed:", err.message);
  console.error("[presence] Enable Presence Intent + Server Members Intent in the Developer Portal.");
  process.exit(1);
});
