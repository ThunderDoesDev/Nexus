/** Known Discord guild feature flags (string list, not a bitfield). */
export const GUILD_FEATURES = [
  {
    id: "ANIMATED_BANNER",
    name: "Animated Banner",
    description: "Guild can set an animated banner image",
  },
  {
    id: "ANIMATED_ICON",
    name: "Animated Icon",
    description: "Guild can set an animated icon",
  },
  {
    id: "APPLICATION_COMMAND_PERMISSIONS_V2",
    name: "Command Permissions V2",
    description: "Guild is using the new application command permissions system",
  },
  {
    id: "AUTO_MODERATION",
    name: "AutoMod",
    description: "Guild has AutoMod enabled",
  },
  {
    id: "BANNER",
    name: "Banner",
    description: "Guild can set a banner image",
  },
  {
    id: "COMMUNITY",
    name: "Community",
    description: "Guild is a Community server",
  },
  {
    id: "CREATOR_MONETIZABLE_PROVISIONAL",
    name: "Creator Monetizable",
    description: "Guild has enabled monetization",
  },
  {
    id: "CREATOR_STORE_PAGE",
    name: "Creator Store Page",
    description: "Guild has created a store page",
  },
  {
    id: "DEVELOPER_SUPPORT_SERVER",
    name: "Developer Support Server",
    description: "Guild is set as a Support Server in the App Directory",
  },
  {
    id: "DISCOVERABLE",
    name: "Discoverable",
    description: "Guild is discoverable in Server Discovery",
  },
  {
    id: "FEATURABLE",
    name: "Featurable",
    description: "Guild is able to be featured in Discovery",
  },
  {
    id: "INVITES_DISABLED",
    name: "Invites Disabled",
    description: "Guild has paused invites",
  },
  {
    id: "INVITE_SPLASH",
    name: "Invite Splash",
    description: "Guild can set an invite splash background",
  },
  {
    id: "MEMBER_VERIFICATION_GATE_ENABLED",
    name: "Membership Screening",
    description: "Guild has Membership Screening enabled",
  },
  {
    id: "MORE_SOUNDBOARD",
    name: "More Soundboard",
    description: "Guild has increased custom soundboard slot limit",
  },
  {
    id: "MORE_STICKERS",
    name: "More Stickers",
    description: "Guild has increased custom sticker slots",
  },
  {
    id: "NEWS",
    name: "News Channels",
    description: "Guild can create Announcement channels",
  },
  {
    id: "PARTNERED",
    name: "Partnered",
    description: "Guild is partnered",
  },
  {
    id: "PREVIEW_ENABLED",
    name: "Preview Enabled",
    description: "Guild can be previewed before joining",
  },
  {
    id: "RAID_ALERTS_DISABLED",
    name: "Raid Alerts Disabled",
    description: "Guild has disabled raid alerts",
  },
  {
    id: "ROLE_ICONS",
    name: "Role Icons",
    description: "Guild can set role icons",
  },
  {
    id: "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE",
    name: "Role Subscriptions for Purchase",
    description: "Role subscriptions available for purchase",
  },
  {
    id: "ROLE_SUBSCRIPTIONS_ENABLED",
    name: "Role Subscriptions Enabled",
    description: "Guild has role subscriptions enabled",
  },
  {
    id: "SOUNDBOARD",
    name: "Soundboard",
    description: "Guild has soundboard enabled",
  },
  {
    id: "TICKETED_EVENTS_ENABLED",
    name: "Ticketed Events",
    description: "Guild can create ticketed events",
  },
  {
    id: "VANITY_URL",
    name: "Vanity URL",
    description: "Guild has access to a vanity URL",
  },
  {
    id: "VERIFIED",
    name: "Verified",
    description: "Guild is verified",
  },
  {
    id: "VIP_REGIONS",
    name: "VIP Voice Regions",
    description: "Guild has access to VIP voice regions",
  },
  {
    id: "WELCOME_SCREEN_ENABLED",
    name: "Welcome Screen",
    description: "Guild has Welcome Screen enabled",
  },
  {
    id: "GUESTS_ENABLED",
    name: "Guests Enabled",
    description: "Guild has guest invites enabled",
  },
  {
    id: "GUILD_TAGS",
    name: "Guild Tags",
    description: "Guild can set a clan/tag",
  },
  {
    id: "ENHANCED_ROLE_COLORS",
    name: "Enhanced Role Colors",
    description: "Guild can use holographic / enhanced role colors",
  },
];

export function parseFeatureList(input) {
  if (!input?.trim()) return [];
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      return parsed.map(String).map((s) => s.trim()).filter(Boolean);
    }
  } catch {
    /* not JSON */
  }
  return input
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function describeFeatures(ids) {
  const known = Object.fromEntries(GUILD_FEATURES.map((f) => [f.id, f]));
  return ids.map((id) => known[id] || { id, name: id, description: "Unknown / undocumented feature" });
}
