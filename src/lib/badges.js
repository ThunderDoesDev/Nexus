const BADGE_CDN = "https://cdn.discordapp.com/badge-icons";

/** Discord CDN asset hashes for profile badges (public_flags). */
const USER_BADGE_ICONS = {
  STAFF: "5e74e9b61934fc1f67c65515d1f7e60d",
  PARTNER: "3f9748e53446a137a052f3454e2de41e",
  HYPESQUAD: "bf01d1073931f921909045f3a39fd264",
  BUG_HUNTER_LEVEL_1: "2717692c7dca7289b35297368a940dd0",
  HYPESQUAD_ONLINE_HOUSE_1: "8a88d63823d8a71cd5e390baa45efa02",
  HYPESQUAD_ONLINE_HOUSE_2: "011940fd013da3f7fb926e4a1cd2e618",
  HYPESQUAD_ONLINE_HOUSE_3: "3aa41de486fa12454c3761e8e223442e",
  PREMIUM_EARLY_SUPPORTER: "7060786766c9c840eb3019e725d2b358",
  BUG_HUNTER_LEVEL_2: "848f79194d4be5ff5f81505cbd0ce1e6",
  VERIFIED_DEVELOPER: "6df5892e0f35b051f8b61eace34f4967",
  CERTIFIED_MODERATOR: "fee1624003e2fee35cb398e125dc479b",
  ACTIVE_DEVELOPER: "6bdc42827a38498929a4920da12695d9",
};

const VERIFIED_BOT_ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 16 15.2"><path d="M7.4,11.17,4,8.62,5,7.26l2,1.53L10.64,4l1.36,1Z" fill="#fff"/><path d="M12.5,0H3.5A3.5,3.5,0,0,0,0,3.5v8.1A3.5,3.5,0,0,0,3.5,15h9A3.5,3.5,0,0,0,16,11.6V3.5A3.5,3.5,0,0,0,12.5,0Zm1.7,11.6a1.7,1.7,0,0,1-1.7,1.7H3.5A1.7,1.7,0,0,1,1.8,11.6V3.5A1.7,1.7,0,0,1,3.5,1.8h9A1.7,1.7,0,0,1,14.2,3.5Z" fill="#5865f2"/></svg>`
  );

const GUILD_VERIFIED_ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 16 15.2"><path fill="#3BA55C" d="M16 7.6c0 .79-1.28 1.38-1.52 2.09s.44 2 0 2.59-1.84.35-2.46.8-1.05 1.76-1.88 1.76-1.29-.98-2.14-1.07-1.69.66-2.46.3-1.07-1.58-1.88-1.94-1.84.12-2.46-.43-.61-1.82 0-2.6S0 8.39 0 7.6s1.28-1.38 1.52-2.09-.44-2 0-2.59 1.85-.35 2.48-.8S5.05.36 5.88.36s1.29.98 2.14 1.07 1.69-.66 2.46-.3 1.07 1.58 1.88 1.94 1.84-.12 2.46.43.61 1.82 0 2.6S16 6.81 16 7.6z"/><path d="M7.4,11.17,4,8.62,5,7.26l2,1.53L10.64,4l1.36,1Z" fill="#fff"/></svg>`
  );

function iconUrl(hash) {
  return `${BADGE_CDN}/${hash}.png`;
}

/**
 * Resolve visible Discord profile badges from public_flags.
 * @returns {{ id: string, key: string, name: string, iconUrl: string }[]}
 */
export function resolveUserBadges(publicFlags, { bot = false } = {}) {
  const flags = Number(publicFlags) || 0;
  const badges = [];

  if (bot && flags & (1 << 16)) {
    badges.push({
      id: "verified_bot",
      key: "VERIFIED_BOT",
      name: "Verified Bot",
      iconUrl: VERIFIED_BOT_ICON,
    });
  }

  const entries = [
    ["STAFF", 1 << 0, "Discord Employee"],
    ["PARTNER", 1 << 1, "Partnered Server Owner"],
    ["HYPESQUAD", 1 << 2, "HypeSquad Events"],
    ["BUG_HUNTER_LEVEL_1", 1 << 3, "Bug Hunter Level 1"],
    ["HYPESQUAD_ONLINE_HOUSE_1", 1 << 6, "HypeSquad Bravery"],
    ["HYPESQUAD_ONLINE_HOUSE_2", 1 << 7, "HypeSquad Brilliance"],
    ["HYPESQUAD_ONLINE_HOUSE_3", 1 << 8, "HypeSquad Balance"],
    ["PREMIUM_EARLY_SUPPORTER", 1 << 9, "Early Supporter"],
    ["BUG_HUNTER_LEVEL_2", 1 << 14, "Bug Hunter Level 2"],
    ["VERIFIED_DEVELOPER", 1 << 17, "Early Verified Bot Developer"],
    ["CERTIFIED_MODERATOR", 1 << 18, "Moderator Programs Alumni"],
    ["ACTIVE_DEVELOPER", 1 << 22, "Active Developer"],
  ];

  for (const [key, bit, name] of entries) {
    if (!(flags & bit)) continue;
    const hash = USER_BADGE_ICONS[key];
    if (!hash) continue;
    badges.push({
      id: key.toLowerCase(),
      key,
      name,
      iconUrl: iconUrl(hash),
    });
  }

  return badges;
}

/**
 * Guild feature badges with icons.
 */
export function resolveGuildBadges(features = []) {
  const set = new Set(features || []);
  const badges = [];

  if (set.has("VERIFIED")) {
    badges.push({
      id: "guild_verified",
      key: "VERIFIED",
      name: "Verified",
      iconUrl: GUILD_VERIFIED_ICON,
    });
  }
  if (set.has("PARTNERED")) {
    badges.push({
      id: "guild_partnered",
      key: "PARTNERED",
      name: "Partnered",
      iconUrl: iconUrl(USER_BADGE_ICONS.PARTNER),
    });
  }

  return badges;
}

export function badgeIconUrl(hash) {
  if (!hash) return "";
  if (String(hash).startsWith("http") || String(hash).startsWith("data:")) return String(hash);
  return iconUrl(hash);
}
