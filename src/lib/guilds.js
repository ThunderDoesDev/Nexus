import { buildCdnUrl, defaultAvatarUrl, sanitizeSnowflake } from "./cdn";
import { resolveGuildBadges } from "./badges";
import { decodeSnowflake } from "./snowflake";
import { describeFeatures } from "./guildFeatures";

const SNOWFLAKE_RE = /^\d{17,20}$/;

const VERIFICATION_LEVELS = [
  "None",
  "Low",
  "Medium",
  "High",
  "Very High",
];

const NSFW_LEVELS = ["Default", "Explicit", "Safe", "Age Restricted"];

const PREMIUM_TIERS = ["None", "Level 1", "Level 2", "Level 3"];

export function parseGuildId(input) {
  const id = sanitizeSnowflake(input);
  return SNOWFLAKE_RE.test(id) ? id : null;
}

function botHeaders(token) {
  return {
    Accept: "application/json",
    Authorization: `Bot ${token}`,
  };
}

function timeoutSignal(ms) {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

async function fetchJson(url, headers = { Accept: "application/json" }) {
  try {
    const response = await fetch(url, {
      headers,
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

function iconUrl(guildId, hash, size = 256) {
  if (!hash) return null;
  return buildCdnUrl("guildIcon", { guildId, hash, size, format: "" });
}

function bannerUrl(guildId, hash, size = 512) {
  if (!guildId || !hash) return null;
  return buildCdnUrl("guildBanner", { guildId, hash, size, format: "" });
}

function splashUrl(guildId, hash, size = 512) {
  if (!guildId || !hash) return null;
  return `https://cdn.discordapp.com/splashes/${guildId}/${hash}.png?size=${size}`;
}

function discoverySplashUrl(guildId, hash, size = 512) {
  if (!guildId || !hash) return null;
  return `https://cdn.discordapp.com/discovery-splashes/${guildId}/${hash}.png?size=${size}`;
}

/**
 * Look up a guild via bot membership, preview, and/or public widget.
 */
export async function lookupGuildDetails(guildId, token) {
  if (!parseGuildId(guildId)) {
    return { error: "Enter a valid guild snowflake ID.", status: 400 };
  }
  if (!token) {
    return {
      error: "Guild lookup requires a bot token in settings/config.json.",
      status: 503,
    };
  }

  const [widgetResult, guildResult, previewResult] = await Promise.all([
    fetchJson(`https://discord.com/api/v10/guilds/${guildId}/widget.json`),
    fetchJson(
      `https://discord.com/api/v10/guilds/${guildId}?with_counts=true`,
      botHeaders(token)
    ),
    fetchJson(`https://discord.com/api/v10/guilds/${guildId}/preview`, botHeaders(token)),
  ]);

  const widget = widgetResult.ok ? widgetResult.data : null;
  const guild = guildResult.ok ? guildResult.data : null;
  const preview = previewResult.ok ? previewResult.data : null;

  if (!widget && !guild && !preview) {
    if (widgetResult.status === 403 || previewResult.status === 403) {
      return {
        error:
          "This server is private. The bot must be in the guild, or enable the public Server Widget / Discovery.",
        status: 403,
      };
    }
    return { error: "Server not found. Check the guild ID.", status: 404 };
  }

  let invite = null;
  const inviteSource =
    widget?.instant_invite ||
    (guild?.vanity_url_code ? `https://discord.gg/${guild.vanity_url_code}` : null) ||
    null;
  if (inviteSource) {
    const code = inviteCodeFromUrl(inviteSource);
    if (code) {
      const inviteResult = await fetchJson(
        `https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true&with_expiration=true`
      );
      invite = inviteResult.ok ? inviteResult.data : null;
    }
  }

  const inviteGuild = invite?.guild || null;
  const id = guild?.id || preview?.id || inviteGuild?.id || widget?.id || guildId;
  const name =
    guild?.name || preview?.name || inviteGuild?.name || widget?.name || "Unknown Server";
  const iconHash = guild?.icon || preview?.icon || inviteGuild?.icon || null;
  const bannerHash = guild?.banner || inviteGuild?.banner || null;
  const splashHash = guild?.splash || preview?.splash || inviteGuild?.splash || null;
  const discoverySplashHash =
    guild?.discovery_splash || preview?.discovery_splash || null;
  const features = guild?.features || preview?.features || inviteGuild?.features || [];
  const memberCount =
    guild?.approximate_member_count ??
    preview?.approximate_member_count ??
    invite?.approximate_member_count ??
    null;
  const presenceCount =
    guild?.approximate_presence_count ??
    preview?.approximate_presence_count ??
    invite?.approximate_presence_count ??
    widget?.presence_count ??
    null;
  const vanity =
    guild?.vanity_url_code || inviteGuild?.vanity_url_code || null;
  const joinUrl = normalizeInviteUrl(
    widget?.instant_invite || vanity || (invite?.code ? invite.code : null)
  );
  const decoded = decodeSnowflake(id);
  const badges = resolveGuildBadges(features);
  const premiumTier = guild?.premium_tier ?? inviteGuild?.premium_tier ?? null;

  return {
    data: {
      id,
      name,
      description:
        guild?.description || preview?.description || inviteGuild?.description || null,
      icon: iconHash ? iconUrl(id, iconHash, 256) : defaultAvatarUrl(id),
      iconHash,
      banner: bannerUrl(id, bannerHash, 512),
      bannerHash,
      splash: splashUrl(id, splashHash, 512),
      splashHash,
      discoverySplash: discoverySplashUrl(id, discoverySplashHash, 512),
      discoverySplashHash,
      ownerId: guild?.owner_id || null,
      vanityUrlCode: vanity,
      inviteUrl: joinUrl,
      memberCount,
      presenceCount,
      premiumTier,
      premiumTierLabel:
        premiumTier == null ? null : PREMIUM_TIERS[premiumTier] || `Level ${premiumTier}`,
      premiumSubscriptionCount:
        guild?.premium_subscription_count ?? inviteGuild?.premium_subscription_count ?? null,
      verificationLevel:
        guild?.verification_level != null
          ? VERIFICATION_LEVELS[guild.verification_level] ||
            String(guild.verification_level)
          : null,
      verificationLevelRaw: guild?.verification_level ?? null,
      nsfwLevel:
        guild?.nsfw_level != null
          ? NSFW_LEVELS[guild.nsfw_level] || String(guild.nsfw_level)
          : null,
      nsfwLevelRaw: guild?.nsfw_level ?? null,
      preferredLocale: guild?.preferred_locale || null,
      features,
      featureDetails: describeFeatures(features),
      badges,
      emojiCount: preview?.emojis?.length ?? guild?.emojis?.length ?? null,
      stickerCount: preview?.stickers?.length ?? guild?.stickers?.length ?? null,
      createdAt: decoded?.createdAt?.toISOString?.() ?? null,
      widgetEnabled: Boolean(widget),
      widgetChannels: Array.isArray(widget?.channels)
        ? widget.channels.map((c) => ({
            id: c.id,
            name: c.name,
            position: c.position,
          }))
        : [],
      source: {
        guild: Boolean(guild),
        preview: Boolean(preview),
        widget: Boolean(widget),
        invite: Boolean(inviteGuild || joinUrl),
      },
    },
  };
}
