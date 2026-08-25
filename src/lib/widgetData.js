import { decodeSnowflake } from "./snowflake";
import { buildCdnUrl, defaultAvatarUrl } from "./cdn";
import { getBotToken } from "./botToken";
import { resolveGuildBadges, resolveUserBadges } from "./badges";

function botHeaders(token) {
  return {
    Accept: "application/json",
    Authorization: `Bot ${token}`,
  };
}

function toHexColor(color) {
  if (color == null) return null;
  return `#${Number(color).toString(16).padStart(6, "0")}`;
}

function formatCount(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Number(value).toLocaleString();
}

function createdAtFromId(id) {
  const decoded = decodeSnowflake(id);
  return decoded?.createdAt?.toISOString?.() ?? null;
}

export function isSnowflake(id) {
  return /^\d{17,20}$/.test(String(id || ""));
}

function timeoutSignal(ms) {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

async function fetchJson(url, headers = { Accept: "application/json" }, options = {}) {
  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: options.body,
      signal: timeoutSignal(8000),
    });
    let data = null;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }
    if (!response.ok) return { ok: false, status: response.status, data };
    return { ok: true, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

function avatarUrl(userId, hash, size = 128) {
  if (!hash) return defaultAvatarUrl(userId);
  return buildCdnUrl("avatar", { userId, hash, size, format: "" });
}

function bannerUrl(id, hash, size = 512) {
  if (!id || !hash) return null;
  return buildCdnUrl("userBanner", { userId: id, hash, size, format: "" });
}

function guildIconUrl(guildId, hash, size = 128) {
  if (!guildId || !hash) return null;
  return buildCdnUrl("guildIcon", { guildId, hash, size, format: "" });
}

function appIconUrl(appId, hash, size = 128) {
  if (!appId || !hash) return null;
  return buildCdnUrl("appIcon", { appId, hash, size, format: "" });
}

/** Widget enabled, or guild exists but widget is disabled (403). */
function isGuildSignal(result) {
  return Boolean(result?.ok || result?.status === 403);
}

function inviteCodeFromUrl(value) {
  if (!value) return null;
  const match = String(value).match(
    /(?:discord(?:app)?\.com\/invite\/|discord\.gg\/)([a-zA-Z0-9-]+)/i
  );
  return match?.[1] || (/^[a-zA-Z0-9-]+$/.test(String(value)) ? String(value) : null);
}

function normalizeInviteUrl(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const code = inviteCodeFromUrl(raw) || raw.replace(/^\/+/, "");
  if (!code) return null;
  return `https://discord.gg/${code}`;
}

async function fetchInvitePreview(inviteUrlOrCode) {
  const code = inviteCodeFromUrl(inviteUrlOrCode);
  if (!code) return null;
  const result = await fetchJson(
    `https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true&with_expiration=true`
  );
  return result.ok ? result.data : null;
}

async function searchDirectoryByUser(user) {
  if (!user?.username) return null;
  const result = await fetchJson(
    `https://discord.com/api/v10/application-directory-static/search?query=${encodeURIComponent(user.username)}&page_size=25`
  );
  if (!result.ok) return null;
  const match = result.data?.results?.find(
    (entry) => entry.data?.bot?.id === user.id || entry.data?.id === user.id
  );
  return match?.data ?? null;
}

/** Fetch guild preview via Discord API (works for discoverable / preview-enabled servers). */
async function fetchGuildPreview(guildId, token) {
  if (!token) return { ok: false, data: null };
  return fetchJson(`https://discord.com/api/v10/guilds/${guildId}/preview`, botHeaders(token));
}

/**
 * Light type check — profile lookups never require mutual guild membership.
 */
async function classifyForType(type, id, token) {
  if (type === "app") {
    const userRes = token
      ? await fetchJson(`https://discord.com/api/v10/users/${id}`, botHeaders(token))
      : { ok: false, data: null };
    const user = userRes.ok ? userRes.data : null;

    if (user?.bot) return { kind: "bot", user };

    if (user && !user.bot) {
      const [rpc, directory] = await Promise.all([
        fetchJson(`https://discord.com/api/v10/applications/${id}/rpc`),
        fetchJson(`https://discord.com/api/v10/application-directory-static/applications/${id}`),
      ]);
      if (rpc.ok || directory.ok) return { kind: "app", user };
      return { kind: "user", user };
    }

    const [widget, rpc, preview] = await Promise.all([
      fetchJson(`https://discord.com/api/v10/guilds/${id}/widget.json`),
      fetchJson(`https://discord.com/api/v10/applications/${id}/rpc`),
      fetchGuildPreview(id, token),
    ]);
    if (isGuildSignal(widget) || preview.ok) return { kind: "guild", user: null };
    if (rpc.ok) return { kind: "app", user: null };
    return { kind: "unknown", user: null };
  }

  if (type === "user") {
    const [userRes, widget, preview] = await Promise.all([
      token
        ? fetchJson(`https://discord.com/api/v10/users/${id}`, botHeaders(token))
        : Promise.resolve({ ok: false, data: null }),
      fetchJson(`https://discord.com/api/v10/guilds/${id}/widget.json`),
      fetchGuildPreview(id, token),
    ]);
    if (userRes.ok) {
      return { kind: userRes.data.bot ? "bot" : "user", user: userRes.data };
    }
    if (isGuildSignal(widget) || preview.ok) return { kind: "guild", user: null };
    const rpc = await fetchJson(`https://discord.com/api/v10/applications/${id}/rpc`);
    if (rpc.ok) return { kind: "app", user: null };
    return { kind: "unknown", user: null };
  }

  if (type === "guild") {
    const [widget, guild, preview] = await Promise.all([
      fetchJson(`https://discord.com/api/v10/guilds/${id}/widget.json`),
      token
        ? fetchJson(`https://discord.com/api/v10/guilds/${id}`, botHeaders(token))
        : Promise.resolve({ ok: false }),
      fetchGuildPreview(id, token),
    ]);
    if (isGuildSignal(widget) || guild.ok || preview.ok) return { kind: "guild", user: null };

    const userRes = token
      ? await fetchJson(`https://discord.com/api/v10/users/${id}`, botHeaders(token))
      : { ok: false, data: null };
    if (userRes.ok) {
      return { kind: userRes.data.bot ? "bot" : "user", user: userRes.data };
    }
    const rpc = await fetchJson(`https://discord.com/api/v10/applications/${id}/rpc`);
    if (rpc.ok) return { kind: "app", user: null };
    return { kind: "unknown", user: null };
  }

  return { kind: "unknown", user: null };
}

function mismatchError(message, suggestedType) {
  return { error: message, status: 400, suggestedType };
}

export async function lookupUser(userId, token) {
  if (!isSnowflake(userId)) {
    return { error: "Invalid user ID.", status: 400 };
  }
  if (!token) {
    return {
      error: "User lookup requires a bot token in settings/config.json.",
      status: 503,
    };
  }

  const result = await fetchJson(
    `https://discord.com/api/v10/users/${userId}`,
    botHeaders(token)
  );

  if (!result.ok) {
    if (result.status === 404) return { error: "User not found.", status: 404 };
    return { error: "Failed to fetch user.", status: result.status || 502 };
  }

  const user = result.data;
  if (user.bot) {
    return mismatchError(
      "That ID belongs to an application, not a user. Switch to Application.",
      "app"
    );
  }

  const flags = Number(user.public_flags || 0);
  const badgeList = resolveUserBadges(flags, { bot: Boolean(user.bot) });
  const badgeNames = badgeList.map((b) => b.name);

  return {
    data: {
      type: "user",
      id: user.id,
      name: user.global_name || user.username || "Unknown User",
      username: user.username ? `@${user.username}` : null,
      description: null,
      imageUrl: avatarUrl(user.id, user.avatar, 256),
      bannerUrl: bannerUrl(user.id, user.banner, 512),
      accentColor: toHexColor(user.accent_color),
      badge: user.bot ? (badgeList.find((b) => b.key === "VERIFIED_BOT") ? "Verified Bot" : "Bot") : badgeNames[0] || null,
      badges: badgeList,
      bot: Boolean(user.bot),
      createdAt: createdAtFromId(user.id),
      linkUrl: `https://discord.com/users/${user.id}`,
      linkLabel: "Profile",
      stats: [],
    },
  };
}

export async function lookupGuild(guildId, token) {
  if (!isSnowflake(guildId)) {
    return { error: "Invalid guild ID.", status: 400 };
  }

  if (!token) {
    return {
      error: "Server lookup requires a bot token in settings/config.json.",
      status: 503,
    };
  }

  const [widgetResult, guildResult, previewResult] = await Promise.all([
    fetchJson(`https://discord.com/api/v10/guilds/${guildId}/widget.json`),
    fetchJson(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, botHeaders(token)),
    fetchGuildPreview(guildId, token),
  ]);

  const widget = widgetResult.ok ? widgetResult.data : null;
  const guild = guildResult.ok ? guildResult.data : null;
  const preview = previewResult.ok ? previewResult.data : null;

  if (!widget && !guild && !preview) {
    // Widget 403 ⇒ guild exists but is not publicly readable
    if (widgetResult.status === 403 || previewResult.status === 403) {
      return {
        error:
          "This server is private. Enable the public Server Widget or make it discoverable.",
        status: 403,
      };
    }
    return {
      error: "Server not found. Check the guild ID.",
      status: 404,
    };
  }

  let invite = null;
  const inviteSource =
    widget?.instant_invite ||
    (guild?.vanity_url_code ? `https://discord.gg/${guild.vanity_url_code}` : null) ||
    null;
  if (inviteSource) {
    invite = await fetchInvitePreview(inviteSource);
  }

  const inviteGuild = invite?.guild || null;
  const joinUrl = normalizeInviteUrl(
    widget?.instant_invite ||
      (guild?.vanity_url_code ? guild.vanity_url_code : null) ||
      (invite?.code ? invite.code : null)
  );

  const id = guild?.id || preview?.id || inviteGuild?.id || widget?.id || guildId;
  const name =
    guild?.name || preview?.name || inviteGuild?.name || widget?.name || "Unknown Server";
  const iconHash = guild?.icon || preview?.icon || inviteGuild?.icon || null;
  const bannerHash = guild?.banner || inviteGuild?.banner || null;
  const splashHash = guild?.splash || preview?.splash || inviteGuild?.splash || null;
  const members =
    guild?.approximate_member_count ??
    preview?.approximate_member_count ??
    invite?.approximate_member_count ??
    null;
  const online =
    guild?.approximate_presence_count ??
    preview?.approximate_presence_count ??
    invite?.approximate_presence_count ??
    widget?.presence_count ??
    null;
  const description =
    guild?.description || preview?.description || inviteGuild?.description || null;
  const features = guild?.features || preview?.features || inviteGuild?.features || [];
  const badgeList = resolveGuildBadges(features);

  return {
    data: {
      type: "guild",
      id,
      name,
      username: null,
      description,
      imageUrl: iconHash ? guildIconUrl(id, iconHash, 256) : defaultAvatarUrl(id),
      bannerUrl: bannerHash
        ? buildCdnUrl("guildBanner", { guildId: id, hash: bannerHash, size: 512, format: "" })
        : splashHash
          ? `https://cdn.discordapp.com/splashes/${id}/${splashHash}.png?size=512`
          : null,
      accentColor: null,
      badge: badgeList[0]?.name || null,
      badges: badgeList,
      createdAt: createdAtFromId(id),
      linkUrl: joinUrl,
      linkLabel: joinUrl ? "Join Server" : null,
      members: formatCount(members),
      online: formatCount(online),
      stats: [
        { label: "Members", value: formatCount(members) || "—" },
        { label: "Online", value: formatCount(online) || "—" },
      ],
      source: {
        widget: Boolean(widget),
        guild: Boolean(guild),
        preview: Boolean(preview),
        invite: Boolean(inviteGuild || joinUrl),
      },
    },
  };
}

async function fetchDirectoryApplication(applicationId) {
  const result = await fetchJson(
    `https://discord.com/api/v10/application-directory-static/applications/${applicationId}`
  );
  return result.ok ? result.data : null;
}

async function fetchViaRpc(clientId) {
  const result = await fetchJson(`https://discord.com/api/v10/applications/${clientId}/rpc`);
  return result.ok ? result.data : null;
}

export async function lookupApp(appId, token) {
  if (!isSnowflake(appId)) {
    return { error: "Invalid application ID.", status: 400 };
  }

  let directory = await fetchDirectoryApplication(appId);
  const rpc = await fetchViaRpc(appId);

  let user = null;
  let app = null;
  let publicApp = null;

  if (token) {
    let userRes = await fetchJson(
      `https://discord.com/api/v10/users/${directory?.bot?.id || appId}`,
      botHeaders(token)
    );
    user = userRes.ok ? userRes.data : null;

    // Bot user ID works without sharing a server — enrich via directory search
    if (!directory && user?.bot) {
      directory = await searchDirectoryByUser(user);
      if (directory?.bot?.id && directory.bot.id !== user.id) {
        userRes = await fetchJson(
          `https://discord.com/api/v10/users/${directory.bot.id}`,
          botHeaders(token)
        );
        if (userRes.ok) user = userRes.data;
      }
    }

    const resolvedId = directory?.id || appId;
    const [appRes, publicRes] = await Promise.all([
      fetchJson(`https://discord.com/api/v10/applications/${resolvedId}`, botHeaders(token)),
      fetchJson(`https://discord.com/api/v10/applications/${resolvedId}/public`, botHeaders(token)),
    ]);
    app = appRes.ok ? appRes.data : null;
    publicApp = publicRes.ok ? publicRes.data : null;
  }

  if (!directory && !rpc && !app && !publicApp && !user) {
    return {
      error: token
        ? "Application not found. Check the application or application user ID."
        : "Application not found. Set a bot token in settings/config.json to look up any application by ID.",
      status: 404,
    };
  }

  // User ID pasted into Bot/App — don't treat a normal account as an application
  if (user && !user.bot && !directory && !rpc && !app && !publicApp) {
    return mismatchError(
      "That ID belongs to a user account, not an application. Switch to User.",
      "user"
    );
  }

  const id = directory?.id ?? app?.id ?? publicApp?.id ?? rpc?.id ?? appId;
  const bot = directory?.bot ?? (user?.bot ? user : null);
  const botUserId = bot?.id ?? user?.id ?? id;
  const name =
    directory?.name ?? app?.name ?? publicApp?.name ?? rpc?.name ?? user?.global_name ?? user?.username ?? "Unknown App";
  const description =
    directory?.description ||
    directory?.directory_entry?.short_description ||
    app?.description ||
    publicApp?.description ||
    rpc?.description ||
    "";
  const iconHash = directory?.icon ?? app?.icon ?? publicApp?.icon ?? rpc?.icon;
  const imageUrl = iconHash
    ? appIconUrl(id, iconHash, 256)
    : avatarUrl(botUserId, bot?.avatar ?? user?.avatar, 256);
  const verified =
    directory?.is_verified === true ||
    Boolean((bot?.public_flags ?? user?.public_flags ?? 0) & (1 << 16));
  const guilds =
    directory?.directory_entry?.guild_count ??
    app?.approximate_guild_count ??
    publicApp?.approximate_guild_count ??
    null;
  const users =
    app?.approximate_user_install_count ??
    publicApp?.approximate_user_install_count ??
    null;

  const botFlags = bot?.public_flags ?? user?.public_flags ?? 0;
  const badgeList = resolveUserBadges(botFlags, { bot: true });
  if (verified && !badgeList.some((b) => b.key === "VERIFIED_BOT")) {
    badgeList.unshift(...resolveUserBadges(1 << 16, { bot: true }));
  }

  return {
    data: {
      type: "app",
      id,
      name,
      username: bot?.username ? `@${bot.username}` : user?.username ? `@${user.username}` : "Discord Application",
      description,
      imageUrl,
      bannerUrl: (bot?.banner || user?.banner)
        ? bannerUrl(botUserId, bot?.banner || user?.banner, 512)
        : null,
      accentColor: toHexColor(bot?.accent_color ?? user?.accent_color),
      badge: verified ? "Verified" : null,
      badges: badgeList,
      verified,
      createdAt: createdAtFromId(id),
      linkUrl: `https://discord.com/oauth2/authorize?client_id=${id}&scope=bot%20applications.commands`,
      linkLabel: "Invite",
      guilds: formatCount(guilds),
      users: formatCount(users),
      stats: [
        { label: "Servers", value: formatCount(guilds) || "—" },
        { label: "Users", value: formatCount(users) || "—" },
      ],
    },
  };
}

export async function lookupWidgetEntity(type, id) {
  const token = getBotToken();
  if (!["user", "guild", "app"].includes(type)) {
    return { error: "Unknown widget type.", status: 400 };
  }
  if (!isSnowflake(id)) {
    return { error: "Invalid snowflake ID.", status: 400 };
  }

  const classified = await classifyForType(type, id, token);

  // Strict tab matching: user ≠ bot ≠ server
  if (type === "user") {
    if (classified.kind === "bot" || classified.kind === "app") {
      return mismatchError(
        "That ID belongs to an application, not a user. Switch to Application.",
        "app"
      );
    }
    if (classified.kind === "guild") {
      return mismatchError(
        "That ID belongs to a server, not a user. Switch to Server.",
        "guild"
      );
    }
  }

  if (type === "guild") {
    if (classified.kind === "user") {
      return mismatchError(
        "That ID belongs to a user account, not a server. Switch to User.",
        "user"
      );
    }
    if (classified.kind === "bot" || classified.kind === "app") {
      return mismatchError(
        "That ID belongs to an application, not a server. Switch to Application.",
        "app"
      );
    }
  }

  if (type === "app") {
    if (classified.kind === "user") {
      return mismatchError(
        "That ID belongs to a user account, not an application. Switch to User.",
        "user"
      );
    }
    if (classified.kind === "guild") {
      return mismatchError(
        "That ID belongs to a server, not an application. Switch to Server.",
        "guild"
      );
    }
  }

  if (type === "user") return lookupUser(id, token);
  if (type === "guild") return lookupGuild(id, token);
  if (type === "app") return lookupApp(id, token);
  return { error: "Unknown widget type.", status: 400 };
}
