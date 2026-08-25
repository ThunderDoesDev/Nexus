import fs from "fs";
import path from "path";

const STATUS_VALUES = new Set(["online", "idle", "dnd", "offline"]);

const ACTIVITY_PREFIX = {
  0: "Playing",
  1: "Streaming",
  2: "Listening to",
  3: "Watching",
  4: "Custom Status",
  5: "Competing in",
};

function cachePath() {
  return path.join(process.cwd(), "settings", "presence-cache.json");
}

function readCache() {
  try {
    return JSON.parse(fs.readFileSync(cachePath(), "utf8"));
  } catch {
    return {};
  }
}

function writeCache(cache) {
  try {
    const dir = path.dirname(cachePath());
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(cachePath(), JSON.stringify(cache, null, 2));
  } catch {
    // ignore
  }
}

function updateLastSeen(userId, status) {
  if (!userId || !STATUS_VALUES.has(status)) return null;
  const cache = readCache();
  const prev = cache[userId] || {};
  const now = new Date().toISOString();
  if (status !== "offline") {
    cache[userId] = { ...prev, lastSeen: now, lastStatus: status };
    writeCache(cache);
    return now;
  }
  return prev.lastSeen || null;
}

function emojiToText(emoji) {
  if (!emoji) return { text: "", imageUrl: null };
  if (emoji.id) {
    return {
      text: emoji.name ? `:${emoji.name}:` : "",
      imageUrl: `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}?size=48`,
    };
  }
  return { text: emoji.name || "", imageUrl: null };
}

function resolveActivityImage(activity) {
  const key = activity?.assets?.large_image;
  if (!key) return null;
  if (key.startsWith("spotify:")) return `https://i.scdn.co/image/${key.slice(8)}`;
  if (key.startsWith("mp:external/")) {
    try {
      return decodeURIComponent(key.split("/").slice(2).join("/"));
    } catch {
      return null;
    }
  }
  if (activity.application_id && /^[a-zA-Z0-9_]+$/.test(key)) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${key}.png`;
  }
  return null;
}

function formatElapsed(startMs) {
  if (!startMs) return null;
  const seconds = Math.max(0, Math.floor((Date.now() - Number(startMs)) / 1000));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} elapsed`;
  return `${m}:${String(s).padStart(2, "0")} elapsed`;
}

function formatRelative(iso) {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const mins = Math.floor(Math.max(0, Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function normalizeActivity(activity) {
  const type = Number(activity.type);
  const emoji = emojiToText(activity.emoji);
  const prefix = ACTIVITY_PREFIX[type] || "Playing";

  if (type === 4) {
    const text = activity.state || null;
    return {
      id: activity.id || "custom",
      type,
      kind: "custom",
      name: "Custom Status",
      title: text || emoji.text || null,
      details: null,
      state: text,
      prefix: null,
      emoji: emoji.text || null,
      emojiUrl: emoji.imageUrl,
      imageUrl: emoji.imageUrl,
      elapsed: null,
    };
  }

  return {
    id: activity.id || `${activity.name}-${type}`,
    type,
    kind: type === 2 && activity.name === "Spotify" ? "spotify" : "rich",
    name: activity.name || "Unknown",
    title: `${prefix} ${activity.name || ""}`.trim(),
    details: activity.details || null,
    state: activity.state || null,
    prefix,
    emoji: null,
    emojiUrl: null,
    imageUrl: resolveActivityImage(activity),
    elapsed: formatElapsed(activity.timestamps?.start),
  };
}

function spotifyFromLive(live) {
  if (live?.listening_to_spotify && live.spotify) {
    return {
      song: live.spotify.song || null,
      artist: live.spotify.artist || null,
      album: live.spotify.album || null,
      albumArtUrl: live.spotify.album_art_url || null,
      trackUrl: live.spotify.track_id
        ? `https://open.spotify.com/track/${live.spotify.track_id}`
        : null,
    };
  }

  const raw = Array.isArray(live?.activities)
    ? live.activities.find((a) => a.name === "Spotify" && Number(a.type) === 2)
    : null;
  if (!raw) return null;

  const large = raw.assets?.large_image || "";
  return {
    song: raw.details || null,
    artist: (raw.state || "").replace(/;/g, ", "),
    album: raw.assets?.large_text || null,
    albumArtUrl: large.startsWith("spotify:")
      ? `https://i.scdn.co/image/${large.slice("spotify:".length)}`
      : null,
    trackUrl: raw.sync_id ? `https://open.spotify.com/track/${raw.sync_id}` : null,
  };
}

function getPresenceBase() {
  try {
    const config = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "settings", "config.json"), "utf8")
    );
    const fromConfig = String(config.presence?.url || "").trim().replace(/\/$/, "");
    if (fromConfig) return fromConfig;
  } catch {
    // ignore
  }
  return String(process.env.PRESENCE_URL || "http://127.0.0.1:4001").replace(/\/$/, "");
}

/**
 * Fetch presence from the local Nexus presence gateway (bot + Presence Intent).
 */
export async function fetchPresenceProfile(userId) {
  const empty = {
    status: "offline",
    customStatus: null,
    activities: [],
    spotify: null,
    lastSeen: null,
    lastSeenLabel: null,
    source: null,
  };

  if (!/^\d{17,20}$/.test(String(userId || ""))) return empty;

  let live = null;
  try {
    const response = await fetch(`${getPresenceBase()}/v1/users/${userId}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(2500),
    });
    if (response.ok) {
      const json = await response.json();
      if (json?.success && json.data) live = json.data;
    }
  } catch {
    // gateway offline
  }

  if (!live) {
    const cached = readCache()[userId];
    const lastSeen = cached?.lastSeen || null;
    return {
      ...empty,
      lastSeen,
      lastSeenLabel: lastSeen ? formatRelative(lastSeen) : null,
      source: lastSeen ? "cache" : null,
    };
  }

  const status = STATUS_VALUES.has(live.discord_status) ? live.discord_status : "offline";
  const lastSeen = updateLastSeen(userId, status) || readCache()[userId]?.lastSeen || null;
  const activities = (Array.isArray(live.activities) ? live.activities : []).map(normalizeActivity);
  const custom = activities.find((a) => a.kind === "custom") || null;
  const spotify = spotifyFromLive(live);

  const customStatus =
    custom && (custom.title || custom.emoji || custom.emojiUrl)
      ? {
          text: custom.title || null,
          emoji: custom.emoji,
          emojiUrl: custom.emojiUrl,
        }
      : null;

  return {
    status,
    customStatus,
    activities: activities
      .filter((a) => a.kind !== "custom")
      .filter((a) => !(spotify && a.kind === "spotify"))
      .slice(0, 4),
    spotify,
    lastSeen,
    lastSeenLabel:
      status === "offline" && lastSeen
        ? formatRelative(lastSeen)
        : status !== "offline"
          ? "now"
          : null,
    activeOn: {
      desktop: Boolean(live.active_on_discord_desktop),
      mobile: Boolean(live.active_on_discord_mobile),
      web: Boolean(live.active_on_discord_web),
    },
    source: "gateway",
  };
}
