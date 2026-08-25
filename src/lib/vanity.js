import { formatInvite, inviteUrl, parseInviteCode } from "./invites";

/** Vanity / invite slug from a URL or raw code. */
export function parseVanityCode(value) {
  return parseInviteCode(value);
}

export function vanityUrl(code) {
  return inviteUrl(code);
}

/**
 * Interpret a Discord invite response (or 404) as vanity availability.
 * @param {object|null} inviteData raw Discord invite JSON, or null if not found
 * @param {string} code normalized vanity code
 */
export function formatVanityCheck(inviteData, code) {
  const normalized = String(code || "").toLowerCase();

  if (!inviteData) {
    return {
      code: normalized,
      url: vanityUrl(normalized),
      available: true,
      status: "available",
      isVanity: false,
      invite: null,
    };
  }

  const invite = formatInvite(inviteData);
  const guildVanity = invite?.guild?.vanityUrlCode
    ? String(invite.guild.vanityUrlCode).toLowerCase()
    : null;
  const isVanity = guildVanity === normalized;

  return {
    code: invite.code || normalized,
    url: invite.url || vanityUrl(normalized),
    available: false,
    status: "taken",
    isVanity,
    invite,
  };
}
