const MESSAGE_LINK_RE =
  /^(?:https?:\/\/)?(?:(?:ptb|canary)\.)?discord(?:app)?\.com\/channels\/(\d+|@me)\/(\d+)(?:\/(\d+))?\/?(?:\?.*)?$/i;

export function parseMessageLink(input) {
  const raw = (input || "").trim();
  if (!raw) return null;

  const m = raw.match(MESSAGE_LINK_RE);
  if (!m) return null;

  return {
    guildId: m[1],
    channelId: m[2],
    messageId: m[3] || null,
    isDm: m[1] === "@me",
    raw,
  };
}

export function buildMessageLink({ guildId, channelId, messageId, host = "discord.com" } = {}) {
  const guild = (guildId || "").trim() || "@me";
  const channel = (channelId || "").trim();
  if (!channel) return "";
  const base = `https://${host}/channels/${guild}/${channel}`;
  const msg = (messageId || "").trim();
  return msg ? `${base}/${msg}` : base;
}

export const DISCORD_HOSTS = [
  { id: "discord.com", label: "Stable" },
  { id: "ptb.discord.com", label: "PTB" },
  { id: "canary.discord.com", label: "Canary" },
];
