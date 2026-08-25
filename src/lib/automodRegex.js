/**
 * Ready-to-use Discord AutoMod regex patterns (RE2-compatible style).
 * Discord AutoMod uses Rust regex; keep patterns simple and portable.
 */

export const AUTOMOD_REGEX_PRESETS = [
  {
    id: "invites",
    label: "Invite links",
    description: "discord.gg / discord.com/invite vanity-style links",
    pattern: "(?:https?://)?(?:www\\.)?(?:discord(?:app)?\\.com/invite|discord\\.gg)/[a-zA-Z0-9-]+",
    category: "links",
  },
  {
    id: "any-url",
    label: "Any URL",
    description: "http(s) links and www. domains",
    pattern: "(?:https?://|www\\.)\\S+",
    category: "links",
  },
  {
    id: "nitro-scam",
    label: "Nitro scam bait",
    description: "Common free-nitro / steam gift phishing phrasing",
    pattern: "(?:free\\s*nitro|steam\\s*gift|claim\\s*your\\s*nitro|discord\\s*nitro\\s*for\\s*free)",
    category: "scam",
  },
  {
    id: "mass-mention",
    label: "Mass @everyone / @here",
    description: "Literal everyone/here spam (mentions still need AutoMod mention triggers)",
    pattern: "@(?:everyone|here)",
    category: "spam",
  },
  {
    id: "zalgo",
    label: "Zalgo / combining marks",
    description: "Excessive combining diacritics",
    pattern: "\\p{M}{3,}",
    category: "spam",
  },
  {
    id: "caps-spam",
    label: "Long ALL CAPS runs",
    description: "10+ consecutive uppercase letters",
    pattern: "[A-Z]{10,}",
    category: "spam",
  },
  {
    id: "phone",
    label: "Phone numbers",
    description: "Loose international phone-like sequences",
    pattern: "(?:\\+?\\d{1,3}[\\s.-]?)?(?:\\(?\\d{2,4}\\)?[\\s.-]?)?\\d{3,4}[\\s.-]?\\d{3,4}",
    category: "pii",
  },
  {
    id: "email",
    label: "Email addresses",
    description: "Simple email pattern",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    category: "pii",
  },
  {
    id: "ip",
    label: "IPv4 addresses",
    description: "Dotted IPv4",
    pattern: "\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b",
    category: "pii",
  },
  {
    id: "steam-trade",
    label: "Steam trade URLs",
    description: "steamcommunity tradeoffer links",
    pattern: "(?:https?://)?(?:www\\.)?steamcommunity\\.com/tradeoffer/\\S+",
    category: "scam",
  },
  {
    id: "custom-emoji-spam",
    label: "Custom emoji spam",
    description: "3+ custom emoji mentions in a row",
    pattern: "(?:<a?:\\w+:\\d+>\\s*){3,}",
    category: "spam",
  },
  {
    id: "owo",
    label: "Invite + gift combo",
    description: "discord.gift style gift codes",
    pattern: "(?:https?://)?(?:www\\.)?discord(?:app)?\\.gift/[a-zA-Z0-9]+",
    category: "scam",
  },
];

export const AUTOMOD_REGEX_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "links", label: "Links" },
  { id: "scam", label: "Scam" },
  { id: "spam", label: "Spam" },
  { id: "pii", label: "PII" },
  { id: "custom", label: "Custom" },
];

/** Escape a literal string for use inside a Discord AutoMod regex. */
export function escapeRegexLiteral(value) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build a simple keyword/phrase regex from user input.
 * mode: contains | whole | starts | ends | any-of
 */
export function buildCustomAutomodRegex(raw, mode = "contains", flags = { caseInsensitive: true }) {
  const parts = String(raw ?? "")
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(escapeRegexLiteral);

  if (!parts.length) return "";

  let body;
  switch (mode) {
    case "whole":
      body = parts.length === 1 ? `\\b${parts[0]}\\b` : `\\b(?:${parts.join("|")})\\b`;
      break;
    case "starts":
      body = parts.length === 1 ? `^${parts[0]}` : `^(?:${parts.join("|")})`;
      break;
    case "ends":
      body = parts.length === 1 ? `${parts[0]}$` : `(?:${parts.join("|")})$`;
      break;
    case "any-of":
      body = `(?:${parts.join("|")})`;
      break;
    case "contains":
    default:
      body = parts.length === 1 ? parts[0] : `(?:${parts.join("|")})`;
      break;
  }

  // Discord AutoMod doesn't take /flags/ wrappers — document case via (?i) when wanted.
  if (flags.caseInsensitive) return `(?i)${body}`;
  return body;
}

export function testAutomodRegex(pattern, sample) {
  if (!pattern) return { ok: false, error: "Empty pattern", matches: false };
  try {
    // Strip leading (?i) for JS RegExp — Discord supports inline flags; JS needs the i flag.
    let source = pattern;
    let flags = "";
    if (source.startsWith("(?i)")) {
      source = source.slice(4);
      flags = "i";
    }
    // Drop unsupported Unicode property classes gracefully in browsers that lack them
    const re = new RegExp(source, flags);
    return { ok: true, matches: re.test(String(sample ?? "")), error: null };
  } catch (err) {
    return { ok: false, matches: false, error: err?.message || "Invalid regex" };
  }
}
