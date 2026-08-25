import { buildCdnUrl, defaultAvatarUrl, sanitizeSnowflake } from "./cdn";
import { resolveUserBadges } from "./badges";
import { decodeSnowflake } from "./snowflake";
import { parseFlags, userFlags } from "./flags";

const SNOWFLAKE_RE = /^\d{17,20}$/;

export function parseUserId(input) {
  const id = sanitizeSnowflake(input);
  return SNOWFLAKE_RE.test(id) ? id : null;
}

function toHexColor(color) {
  if (color == null) return null;
  return `#${Number(color).toString(16).padStart(6, "0")}`;
}

function avatarUrl(userId, hash, size = 256) {
  if (!hash) return defaultAvatarUrl(userId);
  return buildCdnUrl("avatar", { userId, hash, size, format: "" });
}

function bannerUrl(userId, hash, size = 512) {
  if (!userId || !hash) return null;
  return buildCdnUrl("userBanner", { userId, hash, size, format: "" });
}

function decorationUrl(asset) {
  if (!asset) return null;
  return `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=160&passthrough=false`;
}

function clanBadgeUrl(guildId, badgeHash) {
  if (!guildId || !badgeHash) return null;
  return `https://cdn.discordapp.com/clan-badges/${guildId}/${badgeHash}.png?size=64`;
}

/**
 * Normalize a Discord API user object for the User Lookup tool.
 */
export function formatUser(user) {
  const publicFlags = Number(user.public_flags ?? user.flags ?? 0);
  const badges = resolveUserBadges(publicFlags, { bot: Boolean(user.bot) });
  const flagEntries = parseFlags(publicFlags, userFlags);
  const decoded = decodeSnowflake(user.id);
  const primaryGuild = user.primary_guild || null;
  const decoration = user.avatar_decoration_data || null;

  return {
    id: user.id,
    username: user.username || null,
    globalName: user.global_name || null,
    discriminator:
      user.discriminator && user.discriminator !== "0" ? user.discriminator : null,
    displayName: user.global_name || user.username || "Unknown User",
    mention: user.id ? `<@${user.id}>` : null,
    profileUrl: user.id ? `https://discord.com/users/${user.id}` : null,
    bot: Boolean(user.bot),
    system: Boolean(user.system),
    avatar: avatarUrl(user.id, user.avatar, 256),
    avatarHash: user.avatar || null,
    banner: bannerUrl(user.id, user.banner, 512),
    bannerHash: user.banner || null,
    accentColor: toHexColor(user.accent_color),
    accentColorDecimal: user.accent_color ?? null,
    publicFlags,
    flags: flagEntries.map((f) => ({
      key: f.key,
      name: f.name,
      description: f.description,
    })),
    badges,
    createdAt: decoded?.createdAt?.toISOString?.() ?? null,
    avatarDecoration: decoration
      ? {
          asset: decoration.asset || null,
          skuId: decoration.sku_id || null,
          expiresAt: decoration.expires_at || null,
          url: decorationUrl(decoration.asset),
        }
      : null,
    clan: primaryGuild?.identity_enabled
      ? {
          guildId: primaryGuild.identity_guild_id || null,
          tag: primaryGuild.tag || null,
          badge: clanBadgeUrl(primaryGuild.identity_guild_id, primaryGuild.badge),
        }
      : null,
  };
}
