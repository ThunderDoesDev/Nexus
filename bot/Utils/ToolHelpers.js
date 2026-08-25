/** CommonJS helpers mirroring Nexus website tool logic for bot commands. */

const DISCORD_EPOCH = 1420070400000n;

const PERMISSIONS = {
  CreateInstantInvite: 1n << 0n,
  KickMembers: 1n << 1n,
  BanMembers: 1n << 2n,
  Administrator: 1n << 3n,
  ManageChannels: 1n << 4n,
  ManageGuild: 1n << 5n,
  AddReactions: 1n << 6n,
  ViewAuditLog: 1n << 7n,
  PrioritySpeaker: 1n << 8n,
  Stream: 1n << 9n,
  ViewChannel: 1n << 10n,
  SendMessages: 1n << 11n,
  SendTTSMessages: 1n << 12n,
  ManageMessages: 1n << 13n,
  EmbedLinks: 1n << 14n,
  AttachFiles: 1n << 15n,
  ReadMessageHistory: 1n << 16n,
  MentionEveryone: 1n << 17n,
  UseExternalEmojis: 1n << 18n,
  ViewGuildInsights: 1n << 19n,
  Connect: 1n << 20n,
  Speak: 1n << 21n,
  MuteMembers: 1n << 22n,
  DeafenMembers: 1n << 23n,
  MoveMembers: 1n << 24n,
  UseVAD: 1n << 25n,
  ChangeNickname: 1n << 26n,
  ManageNicknames: 1n << 27n,
  ManageRoles: 1n << 28n,
  ManageWebhooks: 1n << 29n,
  ManageGuildExpressions: 1n << 30n,
  UseApplicationCommands: 1n << 31n,
  RequestToSpeak: 1n << 32n,
  ManageEvents: 1n << 33n,
  ManageThreads: 1n << 34n,
  CreatePublicThreads: 1n << 35n,
  CreatePrivateThreads: 1n << 36n,
  UseExternalStickers: 1n << 37n,
  SendMessagesInThreads: 1n << 38n,
  UseEmbeddedActivities: 1n << 39n,
  ModerateMembers: 1n << 40n,
  ViewCreatorMonetizationAnalytics: 1n << 41n,
  UseSoundboard: 1n << 42n,
  CreateGuildExpressions: 1n << 43n,
  CreateEvents: 1n << 44n,
  UseExternalSounds: 1n << 45n,
  SendVoiceMessages: 1n << 46n,
  SendPolls: 1n << 47n,
  UseExternalApps: 1n << 50n,
};

const INTENTS = {
  Guilds: 1n << 0n,
  GuildMembers: 1n << 1n,
  GuildModeration: 1n << 2n,
  GuildExpressions: 1n << 3n,
  GuildIntegrations: 1n << 4n,
  GuildWebhooks: 1n << 5n,
  GuildInvites: 1n << 6n,
  GuildVoiceStates: 1n << 7n,
  GuildPresences: 1n << 8n,
  GuildMessages: 1n << 9n,
  GuildMessageReactions: 1n << 10n,
  GuildMessageTyping: 1n << 11n,
  DirectMessages: 1n << 12n,
  DirectMessageReactions: 1n << 13n,
  DirectMessageTyping: 1n << 14n,
  MessageContent: 1n << 15n,
  GuildScheduledEvents: 1n << 16n,
  AutoModerationConfiguration: 1n << 20n,
  AutoModerationExecution: 1n << 21n,
  GuildMessagePolls: 1n << 24n,
  DirectMessagePolls: 1n << 25n,
};

const USER_FLAGS = {
  Staff: 1n << 0n,
  Partner: 1n << 1n,
  HypeSquad: 1n << 2n,
  BugHunterLevel1: 1n << 3n,
  HypeSquadOnlineHouse1: 1n << 6n,
  HypeSquadOnlineHouse2: 1n << 7n,
  HypeSquadOnlineHouse3: 1n << 8n,
  PremiumEarlySupporter: 1n << 9n,
  TeamPseudoUser: 1n << 10n,
  BugHunterLevel2: 1n << 14n,
  VerifiedBot: 1n << 16n,
  VerifiedDeveloper: 1n << 17n,
  CertifiedModerator: 1n << 18n,
  BotHttpInteractions: 1n << 19n,
  ActiveDeveloper: 1n << 22n,
};

const TIMESTAMP_STYLES = [
  { name: "Short Time", value: "t" },
  { name: "Long Time", value: "T" },
  { name: "Short Date", value: "d" },
  { name: "Long Date", value: "D" },
  { name: "Short Date/Time", value: "f" },
  { name: "Long Date/Time", value: "F" },
  { name: "Relative", value: "R" },
];

function decodeSnowflake(id) {
  const trimmed = String(id || "").trim();
  if (!/^\d{17,20}$/.test(trimmed)) return null;
  const snowflake = BigInt(trimmed);
  const timestamp = Number((snowflake >> 22n) + DISCORD_EPOCH);
  return {
    id: trimmed,
    timestamp,
    createdAt: new Date(timestamp),
    workerId: Number((snowflake >> 17n) & 0x1fn),
    processId: Number((snowflake >> 12n) & 0x1fn),
    increment: Number(snowflake & 0xfffn),
  };
}

function parseBitfield(value, map) {
  let bits;
  try {
    bits = BigInt(String(value || "0").trim());
  } catch {
    return [];
  }
  if (bits < 0n) return [];
  return Object.entries(map)
    .filter(([, flag]) => (bits & flag) === flag)
    .map(([key]) => key);
}

function hexToDecimal(hex) {
  const cleaned = String(hex || "").replace(/^#/, "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  return parseInt(cleaned, 16);
}

function decimalToHex(decimal) {
  const num = parseInt(decimal, 10);
  if (Number.isNaN(num) || num < 0 || num > 16777215) return null;
  return `#${num.toString(16).padStart(6, "0")}`;
}

function parseMessageLink(input) {
  const raw = String(input || "").trim();
  const m = raw.match(
    /^(?:https?:\/\/)?(?:(?:ptb|canary)\.)?discord(?:app)?\.com\/channels\/(\d+|@me)\/(\d+)(?:\/(\d+))?\/?(?:\?.*)?$/i
  );
  if (!m) return null;
  return {
    guildId: m[1],
    channelId: m[2],
    messageId: m[3] || null,
    isDm: m[1] === "@me",
  };
}

function buildMessageLink({ guildId, channelId, messageId }) {
  const guild = guildId || "@me";
  const channel = String(channelId || "").trim();
  if (!channel) return "";
  const base = `https://discord.com/channels/${guild}/${channel}`;
  return messageId ? `${base}/${messageId}` : base;
}

function buildMention(type, id, name) {
  switch (type) {
    case "user":
      return `<@${id}>`;
    case "channel":
      return `<#${id}>`;
    case "role":
      return `<@&${id}>`;
    case "slash":
      return `</${name || "command"}:${id}>`;
    case "emoji":
      return `<:${name || "emoji"}:${id}>`;
    case "animated":
      return `<a:${name || "emoji"}:${id}>`;
    case "everyone":
      return "@everyone";
    case "here":
      return "@here";
    default:
      return null;
  }
}

function truncate(text, max = 1024) {
  const s = String(text || "");
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function formatList(items, empty = "None") {
  if (!items?.length) return empty;
  return truncate(items.map((i) => `\`${i}\``).join(", "));
}

function baseEmbed(client, title) {
  return new client.modules.discord.EmbedBuilder()
    .setTitle(`${client.settings.bot.name} • ${title}`)
    .setColor(client.settings.bot.embedColor)
    .setFooter({ text: client.footer });
}

module.exports = {
  PERMISSIONS,
  INTENTS,
  USER_FLAGS,
  TIMESTAMP_STYLES,
  decodeSnowflake,
  parseBitfield,
  hexToDecimal,
  decimalToHex,
  parseMessageLink,
  buildMessageLink,
  buildMention,
  truncate,
  formatList,
  baseEmbed,
};
