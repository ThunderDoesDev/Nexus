export const intents = {
  GUILDS: {
    value: 1n << 0n,
    name: "Guilds",
    description: "Guild create/update/delete, channel create/update/delete, threads, and scheduled events",
  },
  GUILD_MEMBERS: {
    value: 1n << 1n,
    name: "Guild Members",
    description: "Guild member add/update/remove",
    privileged: true,
  },
  GUILD_MODERATION: {
    value: 1n << 2n,
    name: "Guild Moderation",
    description: "Ban add/remove and audit log entries",
  },
  GUILD_EXPRESSIONS: {
    value: 1n << 3n,
    name: "Guild Expressions",
    description: "Emoji and sticker create/update/delete",
  },
  GUILD_INTEGRATIONS: {
    value: 1n << 4n,
    name: "Guild Integrations",
    description: "Integration create/update/delete",
  },
  GUILD_WEBHOOKS: {
    value: 1n << 5n,
    name: "Guild Webhooks",
    description: "Webhook create/update/delete",
  },
  GUILD_INVITES: {
    value: 1n << 6n,
    name: "Guild Invites",
    description: "Invite create/update/delete",
  },
  GUILD_VOICE_STATES: {
    value: 1n << 7n,
    name: "Guild Voice States",
    description: "Voice state updates",
  },
  GUILD_PRESENCES: {
    value: 1n << 8n,
    name: "Guild Presences",
    description: "Presence updates (requires Guild Members)",
    privileged: true,
    requires: ["GUILD_MEMBERS"],
  },
  GUILD_MESSAGES: {
    value: 1n << 9n,
    name: "Guild Messages",
    description: "Message create/update/delete in guild channels",
  },
  GUILD_MESSAGE_REACTIONS: {
    value: 1n << 10n,
    name: "Guild Message Reactions",
    description: "Reaction add/remove in guild channels",
  },
  GUILD_MESSAGE_TYPING: {
    value: 1n << 11n,
    name: "Guild Message Typing",
    description: "Typing start in guild channels",
  },
  DIRECT_MESSAGES: {
    value: 1n << 12n,
    name: "Direct Messages",
    description: "Message create/update/delete in DMs",
  },
  DIRECT_MESSAGE_REACTIONS: {
    value: 1n << 13n,
    name: "Direct Message Reactions",
    description: "Reaction add/remove in DMs",
  },
  DIRECT_MESSAGE_TYPING: {
    value: 1n << 14n,
    name: "Direct Message Typing",
    description: "Typing start in DMs",
  },
  MESSAGE_CONTENT: {
    value: 1n << 15n,
    name: "Message Content",
    description: "Message content for messages your bot receives",
    privileged: true,
  },
  GUILD_SCHEDULED_EVENTS: {
    value: 1n << 16n,
    name: "Guild Scheduled Events",
    description: "Scheduled event create/update/delete and user add/remove",
  },
  AUTO_MODERATION_CONFIGURATION: {
    value: 1n << 20n,
    name: "Auto Moderation Configuration",
    description: "Auto moderation rule create/update/delete",
  },
  AUTO_MODERATION_EXECUTION: {
    value: 1n << 21n,
    name: "Auto Moderation Execution",
    description: "Auto moderation rule trigger and action execution",
  },
  GUILD_MESSAGE_POLLS: {
    value: 1n << 24n,
    name: "Guild Message Polls",
    description: "Poll vote add/remove in guild channels",
  },
  DIRECT_MESSAGE_POLLS: {
    value: 1n << 25n,
    name: "Direct Message Polls",
    description: "Poll vote add/remove in DMs",
  },
};

export const intentCategories = {
  SERVER: {
    name: "Server",
    intents: [
      "GUILDS",
      "GUILD_MEMBERS",
      "GUILD_MODERATION",
      "GUILD_EXPRESSIONS",
      "GUILD_INTEGRATIONS",
      "GUILD_WEBHOOKS",
      "GUILD_INVITES",
      "GUILD_VOICE_STATES",
      "GUILD_PRESENCES",
      "GUILD_SCHEDULED_EVENTS",
    ],
  },
  MESSAGES: {
    name: "Messages",
    intents: [
      "GUILD_MESSAGES",
      "GUILD_MESSAGE_REACTIONS",
      "GUILD_MESSAGE_TYPING",
      "MESSAGE_CONTENT",
      "GUILD_MESSAGE_POLLS",
    ],
  },
  DIRECT: {
    name: "Direct Messages",
    intents: [
      "DIRECT_MESSAGES",
      "DIRECT_MESSAGE_REACTIONS",
      "DIRECT_MESSAGE_TYPING",
      "DIRECT_MESSAGE_POLLS",
    ],
  },
  AUTOMOD: {
    name: "Auto Moderation",
    intents: ["AUTO_MODERATION_CONFIGURATION", "AUTO_MODERATION_EXECUTION"],
  },
};

export function calculateIntents(selectedIntents) {
  return selectedIntents.reduce((acc, key) => acc | intents[key].value, 0n);
}

export function parseIntents(value) {
  const intentValue = BigInt(value);
  const selected = [];
  Object.keys(intents).forEach((key) => {
    if ((intentValue & intents[key].value) === intents[key].value) {
      selected.push(key);
    }
  });
  return selected;
}
