export const MENTION_TYPES = [
  {
    id: "user",
    label: "User",
    hint: "Mentions a user",
    build: (id) => `<@${id}>`,
    buildNickname: (id) => `<@!${id}>`,
  },
  {
    id: "channel",
    label: "Channel",
    hint: "Mentions a channel",
    build: (id) => `<#${id}>`,
  },
  {
    id: "role",
    label: "Role",
    hint: "Mentions a role",
    build: (id) => `<@&${id}>`,
  },
  {
    id: "slash",
    label: "Slash command",
    hint: "Command mention (needs name + id)",
    build: (id, name) => `</${name || "command"}:${id}>`,
  },
  {
    id: "emoji",
    label: "Custom emoji",
    hint: "Static custom emoji",
    build: (id, name) => `<:${name || "emoji"}:${id}>`,
  },
  {
    id: "animated",
    label: "Animated emoji",
    hint: "Animated custom emoji",
    build: (id, name) => `<a:${name || "emoji"}:${id}>`,
  },
  {
    id: "everyone",
    label: "@everyone",
    hint: "Everyone mention",
    build: () => "@everyone",
    noId: true,
  },
  {
    id: "here",
    label: "@here",
    hint: "Online members mention",
    build: () => "@here",
    noId: true,
  },
];

const PARSE_PATTERNS = [
  { type: "user", re: /^<@!?(\d{17,20})>$/ },
  { type: "role", re: /^<@&(\d{17,20})>$/ },
  { type: "channel", re: /^<#(\d{17,20})>$/ },
  { type: "slash", re: /^<\/([^:]+):(\d{17,20})>$/ },
  { type: "animated", re: /^<a:([^:]+):(\d{17,20})>$/ },
  { type: "emoji", re: /^<:([^:]+):(\d{17,20})>$/ },
  { type: "everyone", re: /^@everyone$/ },
  { type: "here", re: /^@here$/ },
];

export function parseMention(input) {
  const raw = (input || "").trim();
  if (!raw) return null;

  for (const { type, re } of PARSE_PATTERNS) {
    const m = raw.match(re);
    if (!m) continue;
    if (type === "everyone" || type === "here") return { type, raw };
    if (type === "slash" || type === "emoji" || type === "animated") {
      return { type, name: m[1], id: m[2], raw };
    }
    return { type, id: m[1], raw };
  }
  return null;
}

export function buildMention(typeId, { id = "", name = "", nickname = false } = {}) {
  const type = MENTION_TYPES.find((t) => t.id === typeId);
  if (!type) return "";
  if (type.noId) return type.build();
  if (!id.trim()) return "";
  if (typeId === "user" && nickname && type.buildNickname) {
    return type.buildNickname(id.trim());
  }
  if (type.build.length >= 2) return type.build(id.trim(), name.trim());
  return type.build(id.trim());
}
