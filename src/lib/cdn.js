const CDN = "https://cdn.discordapp.com";

/** Discord accepts jpeg, not jpg. */
export const CDN_FORMATS = ["png", "jpeg", "webp", "gif"];

export const CDN_SIZES = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096];

const ANIMATED_FORMATS = new Set(["png", "jpeg", "webp", "gif"]);
const STATIC_FORMATS = new Set(["png", "jpeg", "webp"]);

function normalizeFormat(format) {
  if (!format) return "";
  const f = String(format).toLowerCase().replace(/^\./, "");
  if (f === "jpg") return "jpeg";
  return f;
}

function isAnimatedHash(hash) {
  return typeof hash === "string" && hash.startsWith("a_");
}

/**
 * Strip pasted CDN URLs / filenames down to the raw hash Discord expects.
 */
export function sanitizeHash(input) {
  if (!input) return "";
  let value = String(input).trim();

  // Full CDN / media URL
  const fromUrl = value.match(
    /(?:cdn\.discordapp\.com|media\.discordapp\.net)\/(?:avatars|icons|banners|splashes|app-icons|role-icons|guilds\/\d+\/users\/\d+\/avatars)\/(?:\d+\/)?([a-zA-Z0-9_]+)\.(?:png|jpe?g|webp|gif)/i
  );
  if (fromUrl) return fromUrl[1];

  // Path-like: avatars/id/hash.png
  const fromPath = value.match(/\/([a-zA-Z0-9_]+)\.(?:png|jpe?g|webp|gif)(?:\?|$)/i);
  if (fromPath && /[a-f0-9_]{16,}/i.test(fromPath[1])) return fromPath[1];

  // hash.ext or a_hash.gif
  value = value.replace(/\.(?:png|jpe?g|webp|gif)$/i, "");
  value = value.replace(/^[`'"]+|[`'"]+$/g, "");
  value = value.split(/[/?#]/)[0];
  return value.trim();
}

export function sanitizeSnowflake(input) {
  if (!input) return "";
  const raw = String(input).trim();

  // <:name:id> or <a:name:id>
  const emojiMention = raw.match(/^<a?:\w+:(\d{17,20})>$/);
  if (emojiMention) return emojiMention[1];

  // <@id> / <@!id> / <#id> / <@&id>
  const mention = raw.match(/^<(?:@!?|#|@&)(\d{17,20})>$/);
  if (mention) return mention[1];

  // CDN URL containing an id
  const fromUrl = raw.match(
    /(?:avatars|icons|banners|splashes|app-icons|role-icons|emojis|users|guilds)\/(\d{17,20})/i
  );
  if (fromUrl) return fromUrl[1];

  return raw.replace(/\D/g, "");
}

function resolveExtension({ hash, format, animated, animatedSupported = true }) {
  const normalized = normalizeFormat(format);
  const wantsAnimated = Boolean(animated || isAnimatedHash(hash));

  if (normalized) {
    if (!animatedSupported && normalized === "gif") return "png";
    return normalized;
  }

  if (animatedSupported && wantsAnimated) return "gif";
  return "png";
}

function buildQuery({ size, animated, extension, hash }) {
  const params = new URLSearchParams();
  const n = Number(size);
  if (n && CDN_SIZES.includes(n)) params.set("size", String(n));

  // Discord serves animated webp/png when animated=true is set
  const wantsAnimated = Boolean(animated || isAnimatedHash(hash));
  if (wantsAnimated && (extension === "webp" || extension === "png")) {
    params.set("animated", "true");
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function makeUrl(path, { hash, size, format, animated, animatedSupported = true } = {}) {
  const extension = resolveExtension({ hash, format, animated, animatedSupported });
  const allowed = animatedSupported ? ANIMATED_FORMATS : STATIC_FORMATS;
  const ext = allowed.has(extension) ? extension : "png";
  return `${CDN}${path}.${ext}${buildQuery({ size, animated, extension: ext, hash })}`;
}

export function defaultAvatarUrl(userId) {
  const id = sanitizeSnowflake(userId);
  if (!id) return `${CDN}/embed/avatars/0.png`;
  try {
    // New username system: (user_id >> 22) % 6
    const index = Number((BigInt(id) >> 22n) % 6n);
    return `${CDN}/embed/avatars/${index}.png`;
  } catch {
    return `${CDN}/embed/avatars/0.png`;
  }
}

export const CDN_KINDS = [
  {
    id: "avatar",
    label: "User avatar",
    hint: "Leave hash empty for the default embed avatar",
    fields: ["userId", "hash", "size", "format", "animated"],
    build: ({ userId, hash, size, format, animated }) => {
      const id = sanitizeSnowflake(userId);
      if (!id) return "";
      const cleanHash = sanitizeHash(hash);
      if (!cleanHash) return defaultAvatarUrl(id);
      return makeUrl(`/avatars/${id}/${cleanHash}`, { hash: cleanHash, size, format, animated });
    },
  },
  {
    id: "guildIcon",
    label: "Guild icon",
    fields: ["guildId", "hash", "size", "format", "animated"],
    build: ({ guildId, hash, size, format, animated }) => {
      const id = sanitizeSnowflake(guildId);
      const cleanHash = sanitizeHash(hash);
      if (!id || !cleanHash) return "";
      return makeUrl(`/icons/${id}/${cleanHash}`, { hash: cleanHash, size, format, animated });
    },
  },
  {
    id: "guildBanner",
    label: "Guild banner",
    fields: ["guildId", "hash", "size", "format", "animated"],
    build: ({ guildId, hash, size, format, animated }) => {
      const id = sanitizeSnowflake(guildId);
      const cleanHash = sanitizeHash(hash);
      if (!id || !cleanHash) return "";
      return makeUrl(`/banners/${id}/${cleanHash}`, { hash: cleanHash, size, format, animated });
    },
  },
  {
    id: "userBanner",
    label: "User banner",
    fields: ["userId", "hash", "size", "format", "animated"],
    build: ({ userId, hash, size, format, animated }) => {
      const id = sanitizeSnowflake(userId);
      const cleanHash = sanitizeHash(hash);
      if (!id || !cleanHash) return "";
      return makeUrl(`/banners/${id}/${cleanHash}`, { hash: cleanHash, size, format, animated });
    },
  },
  {
    id: "memberAvatar",
    label: "Server member avatar",
    hint: "Per-guild avatar for a member",
    fields: ["guildId", "userId", "hash", "size", "format", "animated"],
    build: ({ guildId, userId, hash, size, format, animated }) => {
      const g = sanitizeSnowflake(guildId);
      const u = sanitizeSnowflake(userId);
      const cleanHash = sanitizeHash(hash);
      if (!g || !u || !cleanHash) return "";
      return makeUrl(`/guilds/${g}/users/${u}/avatars/${cleanHash}`, {
        hash: cleanHash,
        size,
        format,
        animated,
      });
    },
  },
  {
    id: "emoji",
    label: "Custom emoji",
    hint: "Needs guild ID + emoji ID (resolved via Discord API)",
    fields: ["guildId", "emojiId", "size", "format", "animated"],
    build: ({ emojiId, size, format, animated }) => {
      const id = sanitizeSnowflake(emojiId);
      if (!id) return "";
      // Prefer png for static — most compatible. gif when animated.
      const extension = resolveExtension({
        hash: animated ? "a_" : "",
        format: format || (animated ? "gif" : "png"),
        animated,
      });
      return makeUrl(`/emojis/${id}`, {
        hash: animated ? "a_" : "",
        size,
        format: extension,
        animated,
      });
    },
  },
  {
    id: "appIcon",
    label: "Application icon",
    fields: ["appId", "hash", "size", "format"],
    build: ({ appId, hash, size, format }) => {
      const id = sanitizeSnowflake(appId);
      const cleanHash = sanitizeHash(hash);
      if (!id || !cleanHash) return "";
      return makeUrl(`/app-icons/${id}/${cleanHash}`, {
        hash: cleanHash,
        size,
        format,
        animatedSupported: false,
      });
    },
  },
  {
    id: "splash",
    label: "Guild splash",
    fields: ["guildId", "hash", "size", "format"],
    build: ({ guildId, hash, size, format }) => {
      const id = sanitizeSnowflake(guildId);
      const cleanHash = sanitizeHash(hash);
      if (!id || !cleanHash) return "";
      return makeUrl(`/splashes/${id}/${cleanHash}`, {
        hash: cleanHash,
        size,
        format,
        animatedSupported: false,
      });
    },
  },
  {
    id: "discoverySplash",
    label: "Discovery splash",
    fields: ["guildId", "hash", "size", "format"],
    build: ({ guildId, hash, size, format }) => {
      const id = sanitizeSnowflake(guildId);
      const cleanHash = sanitizeHash(hash);
      if (!id || !cleanHash) return "";
      return makeUrl(`/discovery-splashes/${id}/${cleanHash}`, {
        hash: cleanHash,
        size,
        format,
        animatedSupported: false,
      });
    },
  },
  {
    id: "roleIcon",
    label: "Role icon",
    hint: "Needs guild ID + role ID (resolved via Discord API)",
    fields: ["guildId", "roleId", "hash", "size", "format"],
    build: ({ roleId, hash, size, format }) => {
      const id = sanitizeSnowflake(roleId);
      const cleanHash = sanitizeHash(hash);
      if (!id || !cleanHash) return "";
      return makeUrl(`/role-icons/${id}/${cleanHash}`, {
        hash: cleanHash,
        size,
        format,
        animatedSupported: false,
      });
    },
  },
];

export function buildCdnUrl(kindId, params) {
  const kind = CDN_KINDS.find((k) => k.id === kindId);
  if (!kind) return "";
  try {
    return kind.build(params || {});
  } catch {
    return "";
  }
}

/**
 * Parse a pasted Discord CDN URL or emoji/user mention into tool fields.
 */
export function parseCdnInput(input) {
  const raw = String(input || "").trim();
  if (!raw) return null;

  // Custom emoji mention
  const emojiMention = raw.match(/^<(a)?:(\w+):(\d{17,20})>$/);
  if (emojiMention) {
    return {
      kindId: "emoji",
      params: {
        emojiId: emojiMention[3],
        animated: Boolean(emojiMention[1]),
        format: emojiMention[1] ? "gif" : "png",
      },
    };
  }

  // Already a CDN URL
  const avatar = raw.match(
    /cdn\.discordapp\.com\/avatars\/(\d{17,20})\/([a-zA-Z0-9_]+)\.(\w+)(?:\?size=(\d+))?/i
  );
  if (avatar) {
    return {
      kindId: "avatar",
      params: {
        userId: avatar[1],
        hash: avatar[2],
        format: normalizeFormat(avatar[3]),
        size: avatar[4] ? Number(avatar[4]) : 256,
        animated: isAnimatedHash(avatar[2]) || avatar[3].toLowerCase() === "gif",
      },
    };
  }

  const memberAvatar = raw.match(
    /cdn\.discordapp\.com\/guilds\/(\d{17,20})\/users\/(\d{17,20})\/avatars\/([a-zA-Z0-9_]+)\.(\w+)(?:\?size=(\d+))?/i
  );
  if (memberAvatar) {
    return {
      kindId: "memberAvatar",
      params: {
        guildId: memberAvatar[1],
        userId: memberAvatar[2],
        hash: memberAvatar[3],
        format: normalizeFormat(memberAvatar[4]),
        size: memberAvatar[5] ? Number(memberAvatar[5]) : 256,
        animated: isAnimatedHash(memberAvatar[3]),
      },
    };
  }

  const icon = raw.match(
    /cdn\.discordapp\.com\/icons\/(\d{17,20})\/([a-zA-Z0-9_]+)\.(\w+)(?:\?size=(\d+))?/i
  );
  if (icon) {
    return {
      kindId: "guildIcon",
      params: {
        guildId: icon[1],
        hash: icon[2],
        format: normalizeFormat(icon[3]),
        size: icon[4] ? Number(icon[4]) : 256,
        animated: isAnimatedHash(icon[2]),
      },
    };
  }

  const banner = raw.match(
    /cdn\.discordapp\.com\/banners\/(\d{17,20})\/([a-zA-Z0-9_]+)\.(\w+)(?:\?size=(\d+))?/i
  );
  if (banner) {
    // Could be user or guild — default to userBanner; UI can switch
    return {
      kindId: "userBanner",
      params: {
        userId: banner[1],
        guildId: banner[1],
        hash: banner[2],
        format: normalizeFormat(banner[3]),
        size: banner[4] ? Number(banner[4]) : 512,
        animated: isAnimatedHash(banner[2]),
      },
    };
  }

  const emoji = raw.match(
    /cdn\.discordapp\.com\/emojis\/(\d{17,20})\.(\w+)(?:\?size=(\d+))?/i
  );
  if (emoji) {
    return {
      kindId: "emoji",
      params: {
        emojiId: emoji[1],
        format: normalizeFormat(emoji[2]),
        size: emoji[3] ? Number(emoji[3]) : 128,
        animated: emoji[2].toLowerCase() === "gif",
      },
    };
  }

  const appIcon = raw.match(
    /cdn\.discordapp\.com\/app-icons\/(\d{17,20})\/([a-zA-Z0-9_]+)\.(\w+)(?:\?size=(\d+))?/i
  );
  if (appIcon) {
    return {
      kindId: "appIcon",
      params: {
        appId: appIcon[1],
        hash: appIcon[2],
        format: normalizeFormat(appIcon[3]),
        size: appIcon[4] ? Number(appIcon[4]) : 256,
      },
    };
  }

  const splash = raw.match(
    /cdn\.discordapp\.com\/(?:discovery-)?splashes\/(\d{17,20})\/([a-zA-Z0-9_]+)\.(\w+)(?:\?size=(\d+))?/i
  );
  if (splash) {
    const discovery = /discovery-splashes/.test(raw);
    return {
      kindId: discovery ? "discoverySplash" : "splash",
      params: {
        guildId: splash[1],
        hash: splash[2],
        format: normalizeFormat(splash[3]),
        size: splash[4] ? Number(splash[4]) : 512,
      },
    };
  }

  const roleIcon = raw.match(
    /cdn\.discordapp\.com\/role-icons\/(\d{17,20})\/([a-zA-Z0-9_]+)\.(\w+)(?:\?size=(\d+))?/i
  );
  if (roleIcon) {
    return {
      kindId: "roleIcon",
      params: {
        roleId: roleIcon[1],
        hash: roleIcon[2],
        format: normalizeFormat(roleIcon[3]),
        size: roleIcon[4] ? Number(roleIcon[4]) : 64,
      },
    };
  }

  const defaultAvatar = raw.match(/cdn\.discordapp\.com\/embed\/avatars\/(\d)\.png/i);
  if (defaultAvatar) {
    return {
      kindId: "avatar",
      params: {
        userId: "",
        hash: "",
        format: "png",
        size: 256,
      },
      note: `Default avatar index ${defaultAvatar[1]}`,
    };
  }

  return null;
}
