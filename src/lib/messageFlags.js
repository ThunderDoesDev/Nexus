/** Discord message flags bitfield. */
export const messageFlags = {
  CROSSPOSTED: {
    value: 1n << 0n,
    name: "Crossposted",
    description: "Message has been published to subscribed channels",
  },
  IS_CROSSPOST: {
    value: 1n << 1n,
    name: "Is Crosspost",
    description: "Message originated from a message in another channel",
  },
  SUPPRESS_EMBEDS: {
    value: 1n << 2n,
    name: "Suppress Embeds",
    description: "Do not include any embeds when serializing this message",
  },
  SOURCE_MESSAGE_DELETED: {
    value: 1n << 3n,
    name: "Source Message Deleted",
    description: "Source message for this crosspost has been deleted",
  },
  URGENT: {
    value: 1n << 4n,
    name: "Urgent",
    description: "Message from Discord urgent message system",
  },
  HAS_THREAD: {
    value: 1n << 5n,
    name: "Has Thread",
    description: "Message has an associated thread with the same id",
  },
  EPHEMERAL: {
    value: 1n << 6n,
    name: "Ephemeral",
    description: "Message is only visible to the interacting user",
  },
  LOADING: {
    value: 1n << 7n,
    name: "Loading",
    description: "Message is an interaction response deferred (bot is thinking)",
  },
  FAILED_TO_MENTION_SOME_ROLES_IN_THREAD: {
    value: 1n << 8n,
    name: "Failed Role Mentions",
    description: "Failed to mention some roles and add their members to the thread",
  },
  SUPPRESS_NOTIFICATIONS: {
    value: 1n << 12n,
    name: "Suppress Notifications",
    description: "Message will not trigger push and desktop notifications",
  },
  IS_VOICE_MESSAGE: {
    value: 1n << 13n,
    name: "Voice Message",
    description: "Message is a voice message",
  },
  HAS_SNAPSHOT: {
    value: 1n << 14n,
    name: "Has Snapshot",
    description: "Message has a snapshot (forwarded message)",
  },
  IS_COMPONENTS_V2: {
    value: 1n << 15n,
    name: "Components V2",
    description: "Message uses Components V2 layout",
  },
};

/** System channel flags bitfield. */
export const systemChannelFlags = {
  SUPPRESS_JOIN_NOTIFICATIONS: {
    value: 1n << 0n,
    name: "Suppress Join Notifications",
    description: "Suppress member join notifications",
  },
  SUPPRESS_PREMIUM_SUBSCRIPTIONS: {
    value: 1n << 1n,
    name: "Suppress Boost Notifications",
    description: "Suppress server boost notifications",
  },
  SUPPRESS_GUILD_REMINDER_NOTIFICATIONS: {
    value: 1n << 2n,
    name: "Suppress Guild Reminders",
    description: "Suppress server setup tips",
  },
  SUPPRESS_JOIN_NOTIFICATION_REPLIES: {
    value: 1n << 3n,
    name: "Suppress Join Replies",
    description: "Hide member join sticker reply buttons",
  },
  SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATIONS: {
    value: 1n << 4n,
    name: "Suppress Role Sub Notifications",
    description: "Suppress role subscription purchase notifications",
  },
  SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATION_REPLIES: {
    value: 1n << 5n,
    name: "Suppress Role Sub Replies",
    description: "Hide role subscription sticker reply buttons",
  },
};
