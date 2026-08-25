/** Discord AutoMod rule builder helpers. */

export const TRIGGER_TYPES = [
  { value: 1, label: "Keyword", description: "Match words / regex / allow list" },
  { value: 3, label: "Spam", description: "System spam detection (no trigger metadata)" },
  { value: 4, label: "Keyword preset", description: "Discord preset word lists" },
  { value: 5, label: "Mention spam", description: "Too many unique mentions" },
];

export const EVENT_TYPES = [{ value: 1, label: "Message send" }];

export const ACTION_TYPES = [
  { value: 1, label: "Block message", description: "Prevent the message from sending" },
  { value: 2, label: "Send alert", description: "Post to an alert channel" },
  { value: 3, label: "Timeout", description: "Timeout the member" },
];

export const KEYWORD_PRESETS = [
  { value: 1, label: "Profanity" },
  { value: 2, label: "Sexual content" },
  { value: 3, label: "Slurs" },
];

let uid = 0;
const nextId = () => `am_${++uid}_${Date.now()}`;

export function emptyAction(type = 1) {
  return {
    id: nextId(),
    type,
    channelId: "",
    customMessage: "",
    durationSeconds: "300",
  };
}

export function createExampleAutomod() {
  return {
    name: "Block invite links",
    eventType: 1,
    triggerType: 1,
    enabled: true,
    keywords: ["discord.gg/*", "discord.com/invite/*"],
    regexPatterns: [],
    allowList: [],
    presets: [1],
    mentionLimit: 5,
    mentionRaidProtection: false,
    exemptRoles: "",
    exemptChannels: "",
    actions: [
      {
        ...emptyAction(1),
        customMessage: "Invite links aren't allowed here.",
      },
      {
        ...emptyAction(2),
        channelId: "123456789012345678",
      },
    ],
  };
}

function parseIdList(value) {
  if (!value?.trim()) return [];
  return value
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => /^\d{17,20}$/.test(s));
}

function buildTriggerMetadata(state) {
  if (state.triggerType === 3) return undefined;

  if (state.triggerType === 5) {
    return {
      mention_total_limit: Math.min(50, Math.max(1, Number(state.mentionLimit) || 5)),
      mention_raid_protection_enabled: Boolean(state.mentionRaidProtection),
    };
  }

  if (state.triggerType === 4) {
    return {
      presets: (state.presets || []).length ? state.presets : [1],
      allow_list: (state.allowList || []).filter(Boolean).slice(0, 1000),
    };
  }

  // Keyword (1)
  const meta = {};
  const keywords = (state.keywords || []).map((k) => k.trim()).filter(Boolean).slice(0, 1000);
  const regex = (state.regexPatterns || []).map((k) => k.trim()).filter(Boolean).slice(0, 10);
  const allow = (state.allowList || []).map((k) => k.trim()).filter(Boolean).slice(0, 100);
  if (keywords.length) meta.keyword_filter = keywords;
  if (regex.length) meta.regex_patterns = regex;
  if (allow.length) meta.allow_list = allow;
  return Object.keys(meta).length ? meta : { keyword_filter: ["badword"] };
}

function buildAction(action) {
  const out = { type: action.type };
  if (action.type === 1 && action.customMessage?.trim()) {
    out.metadata = { custom_message: action.customMessage.trim().slice(0, 150) };
  }
  if (action.type === 2) {
    out.metadata = { channel_id: action.channelId || "0" };
  }
  if (action.type === 3) {
    out.metadata = {
      duration_seconds: Math.min(2419200, Math.max(1, Number(action.durationSeconds) || 60)),
    };
  }
  return out;
}

export function buildAutomodRule(state) {
  const rule = {
    name: (state.name || "AutoMod rule").slice(0, 100),
    event_type: Number(state.eventType) || 1,
    trigger_type: Number(state.triggerType) || 1,
    actions: (state.actions || []).map(buildAction),
    enabled: state.enabled !== false,
  };

  const meta = buildTriggerMetadata(state);
  if (meta) rule.trigger_metadata = meta;

  const roles = parseIdList(state.exemptRoles);
  const channels = parseIdList(state.exemptChannels);
  if (roles.length) rule.exempt_roles = roles;
  if (channels.length) rule.exempt_channels = channels;

  return rule;
}
