/** Discord user public flags (bitfield). */
export const userFlags = {
  STAFF: {
    value: 1n << 0n,
    name: "Discord Employee",
    description: "User is a Discord staff member",
  },
  PARTNER: {
    value: 1n << 1n,
    name: "Partnered Server Owner",
    description: "User owns a Partnered server",
  },
  HYPESQUAD: {
    value: 1n << 2n,
    name: "HypeSquad Events",
    description: "User is a HypeSquad Events member",
  },
  BUG_HUNTER_LEVEL_1: {
    value: 1n << 3n,
    name: "Bug Hunter Level 1",
    description: "Discord Bug Hunter (level 1)",
  },
  HYPESQUAD_ONLINE_HOUSE_1: {
    value: 1n << 6n,
    name: "HypeSquad Bravery",
    description: "House of Bravery",
  },
  HYPESQUAD_ONLINE_HOUSE_2: {
    value: 1n << 7n,
    name: "HypeSquad Brilliance",
    description: "House of Brilliance",
  },
  HYPESQUAD_ONLINE_HOUSE_3: {
    value: 1n << 8n,
    name: "HypeSquad Balance",
    description: "House of Balance",
  },
  PREMIUM_EARLY_SUPPORTER: {
    value: 1n << 9n,
    name: "Early Supporter",
    description: "Purchased Nitro before Oct 10, 2018",
  },
  TEAM_PSEUDO_USER: {
    value: 1n << 10n,
    name: "Team User",
    description: "User is a team",
  },
  BUG_HUNTER_LEVEL_2: {
    value: 1n << 14n,
    name: "Bug Hunter Level 2",
    description: "Discord Bug Hunter (level 2)",
  },
  VERIFIED_BOT: {
    value: 1n << 16n,
    name: "Verified Bot",
    description: "Bot is verified",
  },
  VERIFIED_DEVELOPER: {
    value: 1n << 17n,
    name: "Early Verified Bot Developer",
    description: "Early verified bot developer",
  },
  CERTIFIED_MODERATOR: {
    value: 1n << 18n,
    name: "Moderator Programs Alumni",
    description: "Discord Certified Moderator / alumni",
  },
  BOT_HTTP_INTERACTIONS: {
    value: 1n << 19n,
    name: "Bot HTTP Interactions",
    description: "Bot uses only HTTP interactions",
  },
  ACTIVE_DEVELOPER: {
    value: 1n << 22n,
    name: "Active Developer",
    description: "Active Developer badge",
  },
};

/** Discord application flags (bitfield). */
export const applicationFlags = {
  APPLICATION_AUTO_MODERATION_RULE_CREATE_BADGE: {
    value: 1n << 6n,
    name: "AutoMod Badge",
    description: "Indicates Intent limited application has the AutoMod badge",
  },
  GATEWAY_PRESENCE: {
    value: 1n << 12n,
    name: "Gateway Presence",
    description: "Intent required for Presence Update events",
    privileged: true,
  },
  GATEWAY_PRESENCE_LIMITED: {
    value: 1n << 13n,
    name: "Gateway Presence Limited",
    description: "Presence Update limited to 100 guilds",
  },
  GATEWAY_GUILD_MEMBERS: {
    value: 1n << 14n,
    name: "Gateway Guild Members",
    description: "Intent required for Guild Member events",
    privileged: true,
  },
  GATEWAY_GUILD_MEMBERS_LIMITED: {
    value: 1n << 15n,
    name: "Gateway Guild Members Limited",
    description: "Guild Member events limited to 100 guilds",
  },
  VERIFICATION_PENDING_GUILD_LIMIT: {
    value: 1n << 16n,
    name: "Verification Pending Guild Limit",
    description: "Unusual growth of guilds — verification required",
  },
  EMBEDDED: {
    value: 1n << 17n,
    name: "Embedded",
    description: "Application is embedded in Discord client",
  },
  GATEWAY_MESSAGE_CONTENT: {
    value: 1n << 18n,
    name: "Gateway Message Content",
    description: "Intent required for message content",
    privileged: true,
  },
  GATEWAY_MESSAGE_CONTENT_LIMITED: {
    value: 1n << 19n,
    name: "Gateway Message Content Limited",
    description: "Message content limited to 100 guilds",
  },
  APPLICATION_COMMAND_BADGE: {
    value: 1n << 23n,
    name: "Application Command Badge",
    description: "Indicates the app has registered global commands",
  },
};

export function parseFlags(bitfield, flagMap) {
  let value;
  try {
    value = BigInt(bitfield);
  } catch {
    return [];
  }
  if (value < 0n) return [];

  return Object.entries(flagMap)
    .filter(([, flag]) => (value & flag.value) === flag.value)
    .map(([key, flag]) => ({ key, ...flag, value: flag.value.toString() }));
}

export function combineFlags(keys, flagMap) {
  return keys.reduce((acc, key) => {
    const flag = flagMap[key];
    return flag ? acc | flag.value : acc;
  }, 0n);
}
