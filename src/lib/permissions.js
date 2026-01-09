export const permissions = {
  CREATE_INSTANT_INVITE: { value: 1n << 0n, name: 'Create Instant Invite', description: 'Allows creation of instant invites' },
  KICK_MEMBERS: { value: 1n << 1n, name: 'Kick Members', description: 'Allows kicking members', requiresTwoFactor: true },
  BAN_MEMBERS: { value: 1n << 2n, name: 'Ban Members', description: 'Allows banning members', requiresTwoFactor: true },
  ADMINISTRATOR: { value: 1n << 3n, name: 'Administrator', description: 'Allows all permissions and bypasses channel permission overwrites', requiresTwoFactor: true },
  MANAGE_CHANNELS: { value: 1n << 4n, name: 'Manage Channels', description: 'Allows management and editing of channels', requiresTwoFactor: true },
  MANAGE_GUILD: { value: 1n << 5n, name: 'Manage Server', description: 'Allows management and editing of the server', requiresTwoFactor: true },
  ADD_REACTIONS: { value: 1n << 6n, name: 'Add Reactions', description: 'Allows for the addition of reactions to messages' },
  VIEW_AUDIT_LOG: { value: 1n << 7n, name: 'View Audit Log', description: 'Allows for viewing of audit logs' },
  PRIORITY_SPEAKER: { value: 1n << 8n, name: 'Priority Speaker', description: 'Allows for using priority speaker in a voice channel' },
  STREAM: { value: 1n << 9n, name: 'Video', description: 'Allows the user to go live' },
  VIEW_CHANNEL: { value: 1n << 10n, name: 'View Channels', description: 'Allows guild members to view a channel' },
  SEND_MESSAGES: { value: 1n << 11n, name: 'Send Messages', description: 'Allows for sending messages in a channel' },
  SEND_TTS_MESSAGES: { value: 1n << 12n, name: 'Send TTS Messages', description: 'Allows for sending of /tts messages' },
  MANAGE_MESSAGES: { value: 1n << 13n, name: 'Manage Messages', description: 'Allows for deletion of other users messages', requiresTwoFactor: true },
  EMBED_LINKS: { value: 1n << 14n, name: 'Embed Links', description: 'Links sent by users with this permission will be auto-embedded' },
  ATTACH_FILES: { value: 1n << 15n, name: 'Attach Files', description: 'Allows for uploading images and files' },
  READ_MESSAGE_HISTORY: { value: 1n << 16n, name: 'Read Message History', description: 'Allows for reading of message history' },
  MENTION_EVERYONE: { value: 1n << 17n, name: 'Mention @everyone, @here, and All Roles', description: 'Allows for using @everyone or @here' },
  USE_EXTERNAL_EMOJIS: { value: 1n << 18n, name: 'Use External Emojis', description: 'Allows the usage of custom emojis from other servers' },
  VIEW_GUILD_INSIGHTS: { value: 1n << 19n, name: 'View Server Insights', description: 'Allows for viewing server insights' },
  CONNECT: { value: 1n << 20n, name: 'Connect', description: 'Allows for joining of a voice channel' },
  SPEAK: { value: 1n << 21n, name: 'Speak', description: 'Allows for speaking in a voice channel' },
  MUTE_MEMBERS: { value: 1n << 22n, name: 'Mute Members', description: 'Allows for muting members in a voice channel' },
  DEAFEN_MEMBERS: { value: 1n << 23n, name: 'Deafen Members', description: 'Allows for deafening of members in a voice channel' },
  MOVE_MEMBERS: { value: 1n << 24n, name: 'Move Members', description: 'Allows for moving of members between voice channels' },
  USE_VAD: { value: 1n << 25n, name: 'Use Voice Activity', description: 'Allows for using voice-activity-detection in a voice channel' },
  CHANGE_NICKNAME: { value: 1n << 26n, name: 'Change Nickname', description: 'Allows for modification of own nickname' },
  MANAGE_NICKNAMES: { value: 1n << 27n, name: 'Manage Nicknames', description: 'Allows for modification of other users nicknames' },
  MANAGE_ROLES: { value: 1n << 28n, name: 'Manage Roles', description: 'Allows management and editing of roles', requiresTwoFactor: true },
  MANAGE_WEBHOOKS: { value: 1n << 29n, name: 'Manage Webhooks', description: 'Allows management and editing of webhooks', requiresTwoFactor: true },
  MANAGE_GUILD_EXPRESSIONS: { value: 1n << 30n, name: 'Manage Expressions', description: 'Allows management and editing of emojis, stickers, and soundboard sounds', requiresTwoFactor: true },
  USE_APPLICATION_COMMANDS: { value: 1n << 31n, name: 'Use Application Commands', description: 'Allows members to use application commands' },
  REQUEST_TO_SPEAK: { value: 1n << 32n, name: 'Request to Speak', description: 'Allows for requesting to speak in stage channels' },
  MANAGE_EVENTS: { value: 1n << 33n, name: 'Manage Events', description: 'Allows for creating, editing, and deleting scheduled events' },
  MANAGE_THREADS: { value: 1n << 34n, name: 'Manage Threads', description: 'Allows for deleting and archiving threads, and viewing all private threads', requiresTwoFactor: true },
  CREATE_PUBLIC_THREADS: { value: 1n << 35n, name: 'Create Public Threads', description: 'Allows for creating public and announcement threads' },
  CREATE_PRIVATE_THREADS: { value: 1n << 36n, name: 'Create Private Threads', description: 'Allows for creating private threads' },
  USE_EXTERNAL_STICKERS: { value: 1n << 37n, name: 'Use External Stickers', description: 'Allows the usage of custom stickers from other servers' },
  SEND_MESSAGES_IN_THREADS: { value: 1n << 38n, name: 'Send Messages in Threads', description: 'Allows for sending messages in threads' },
  USE_EMBEDDED_ACTIVITIES: { value: 1n << 39n, name: 'Use Embedded Activities', description: 'Allows for using Activities in a voice channel' },
  MODERATE_MEMBERS: { value: 1n << 40n, name: 'Moderate Members', description: 'Allows for timing out users to prevent them from sending or reacting to messages' },
  VIEW_CREATOR_MONETIZATION_ANALYTICS: { value: 1n << 41n, name: 'View Creator Monetization Analytics', description: 'Allows for viewing role subscription insights', requiresTwoFactor: true },
  USE_SOUNDBOARD: { value: 1n << 42n, name: 'Use Soundboard', description: 'Allows for using soundboard in a voice channel' },
  CREATE_GUILD_EXPRESSIONS: { value: 1n << 43n, name: 'Create Expressions', description: 'Allows for creating emojis, stickers, and soundboard sounds' },
  CREATE_EVENTS: { value: 1n << 44n, name: 'Create Events', description: 'Allows for creating scheduled events' },
  USE_EXTERNAL_SOUNDS: { value: 1n << 45n, name: 'Use External Sounds', description: 'Allows the usage of custom soundboard sounds from other servers' },
  SEND_VOICE_MESSAGES: { value: 1n << 46n, name: 'Send Voice Messages', description: 'Allows sending voice messages' },
  SEND_POLLS: { value: 1n << 47n, name: 'Send Polls', description: 'Allows sending polls' },
  USE_EXTERNAL_APPS: { value: 1n << 50n, name: 'Use External Apps', description: 'Allows members to use apps from other servers' },
};

export const permissionsCategories = {
  GENERAL: {
    name: 'General Permissions',
    permissions: [
      'VIEW_AUDIT_LOG',
      'MANAGE_GUILD',
      'MANAGE_ROLES',
      'MANAGE_CHANNELS',
      'KICK_MEMBERS',
      'BAN_MEMBERS',
      'CREATE_INSTANT_INVITE',
      'CHANGE_NICKNAME',
      'MANAGE_NICKNAMES',
      'MANAGE_GUILD_EXPRESSIONS',
      'CREATE_GUILD_EXPRESSIONS',
      'MANAGE_WEBHOOKS',
      'MANAGE_EVENTS',
      'CREATE_EVENTS',
      'VIEW_GUILD_INSIGHTS',
      'VIEW_CREATOR_MONETIZATION_ANALYTICS',
      'MODERATE_MEMBERS',
      'ADMINISTRATOR',
    ]
  },
  TEXT: {
    name: 'Text Permissions',
    permissions: [
      'VIEW_CHANNEL',
      'SEND_MESSAGES',
      'SEND_TTS_MESSAGES',
      'MANAGE_MESSAGES',
      'EMBED_LINKS',
      'ATTACH_FILES',
      'READ_MESSAGE_HISTORY',
      'MENTION_EVERYONE',
      'USE_EXTERNAL_EMOJIS',
      'USE_EXTERNAL_STICKERS',
      'ADD_REACTIONS',
      'USE_APPLICATION_COMMANDS',
      'MANAGE_THREADS',
      'CREATE_PUBLIC_THREADS',
      'CREATE_PRIVATE_THREADS',
      'SEND_MESSAGES_IN_THREADS',
      'SEND_VOICE_MESSAGES',
      'SEND_POLLS',
    ]
  },
  VOICE: {
    name: 'Voice Permissions',
    permissions: [
      'CONNECT',
      'SPEAK',
      'STREAM',
      'USE_VAD',
      'PRIORITY_SPEAKER',
      'MUTE_MEMBERS',
      'DEAFEN_MEMBERS',
      'MOVE_MEMBERS',
      'USE_EMBEDDED_ACTIVITIES',
      'USE_SOUNDBOARD',
      'USE_EXTERNAL_SOUNDS',
      'REQUEST_TO_SPEAK',
    ]
  },
  APPS: {
    name: 'Apps Permissions',
    permissions: [
      'USE_EXTERNAL_APPS',
    ]
  }
};

export function calculatePermissions(selectedPermissions) {
  return selectedPermissions.reduce((acc, key) => {
    return acc | PERMISSIONS[key].value;
  }, 0n);
}

export function parsePermissions(value) {
  const permissionValue = BigInt(value);
  const selected = [];  
  Object.keys(PERMISSIONS).forEach(key => {
    if ((permissionValue & PERMISSIONS[key].value) === PERMISSIONS[key].value) {
      selected.push(key);
    }
  });  
  return selected;
}
