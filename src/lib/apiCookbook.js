/** Common Discord REST API cookbook entries with curl + fetch snippets. */

export const COOKBOOK_CATEGORIES = [
  { id: "commands", label: "Application commands" },
  { id: "interactions", label: "Interactions" },
  { id: "webhooks", label: "Webhooks" },
  { id: "messages", label: "Messages" },
  { id: "guilds", label: "Guilds" },
];

export const COOKBOOK_ENTRIES = [
  {
    id: "bulk-global-commands",
    category: "commands",
    title: "Bulk overwrite global commands",
    method: "PUT",
    path: "/applications/{application.id}/commands",
    description: "Replace all global application commands with the given array.",
    body: `[\n  {\n    "name": "ping",\n    "description": "Replies with pong",\n    "type": 1\n  }\n]`,
  },
  {
    id: "bulk-guild-commands",
    category: "commands",
    title: "Bulk overwrite guild commands",
    method: "PUT",
    path: "/applications/{application.id}/guilds/{guild.id}/commands",
    description: "Guild-scoped commands update instantly — great for testing.",
    body: `[\n  {\n    "name": "ping",\n    "description": "Guild ping",\n    "type": 1\n  }\n]`,
  },
  {
    id: "create-command",
    category: "commands",
    title: "Create a global command",
    method: "POST",
    path: "/applications/{application.id}/commands",
    description: "Create a single global command.",
    body: `{\n  "name": "echo",\n  "description": "Echo a message",\n  "options": [\n    {\n      "type": 3,\n      "name": "text",\n      "description": "Text to echo",\n      "required": true\n    }\n  ]\n}`,
  },
  {
    id: "interaction-callback",
    category: "interactions",
    title: "Create interaction response",
    method: "POST",
    path: "/interactions/{interaction.id}/{interaction.token}/callback",
    description: "Respond to an interaction within 3 seconds (or defer).",
    body: `{\n  "type": 4,\n  "data": {\n    "content": "Hello!",\n    "flags": 64\n  }\n}`,
    noBotAuth: true,
  },
  {
    id: "followup",
    category: "interactions",
    title: "Create followup message",
    method: "POST",
    path: "/webhooks/{application.id}/{interaction.token}",
    description: "Send an additional message after deferring or replying.",
    body: `{\n  "content": "Follow-up message"\n}`,
    noBotAuth: true,
  },
  {
    id: "edit-original",
    category: "interactions",
    title: "Edit original interaction response",
    method: "PATCH",
    path: "/webhooks/{application.id}/{interaction.token}/messages/@original",
    description: "Update the original response (works after defer).",
    body: `{\n  "content": "Updated response"\n}`,
    noBotAuth: true,
  },
  {
    id: "execute-webhook",
    category: "webhooks",
    title: "Execute webhook",
    method: "POST",
    path: "/webhooks/{webhook.id}/{webhook.token}",
    description: "Post a message as a webhook. Append ?wait=true to get the message object.",
    body: `{\n  "content": "Hello from a webhook",\n  "embeds": [\n    {\n      "title": "Nexus",\n      "description": "Webhook payload"\n    }\n  ]\n}`,
    noBotAuth: true,
  },
  {
    id: "edit-webhook-message",
    category: "webhooks",
    title: "Edit webhook message",
    method: "PATCH",
    path: "/webhooks/{webhook.id}/{webhook.token}/messages/{message.id}",
    description: "Edit a message previously sent by the webhook.",
    body: `{\n  "content": "Edited webhook message"\n}`,
    noBotAuth: true,
  },
  {
    id: "create-message",
    category: "messages",
    title: "Create message",
    method: "POST",
    path: "/channels/{channel.id}/messages",
    description: "Send a channel message with the bot token.",
    body: `{\n  "content": "Hello channel!",\n  "embeds": []\n}`,
  },
  {
    id: "edit-message",
    category: "messages",
    title: "Edit message",
    method: "PATCH",
    path: "/channels/{channel.id}/messages/{message.id}",
    description: "Edit a bot-authored message.",
    body: `{\n  "content": "Edited message"\n}`,
  },
  {
    id: "crosspost",
    category: "messages",
    title: "Crosspost announcement",
    method: "POST",
    path: "/channels/{channel.id}/messages/{message.id}/crosspost",
    description: "Publish a message in an Announcement channel.",
    body: null,
  },
  {
    id: "create-automod",
    category: "guilds",
    title: "Create AutoMod rule",
    method: "POST",
    path: "/guilds/{guild.id}/auto-moderation/rules",
    description: "Create an AutoMod rule (requires MANAGE_GUILD).",
    body: `{\n  "name": "Block invites",\n  "event_type": 1,\n  "trigger_type": 1,\n  "trigger_metadata": {\n    "keyword_filter": ["discord.gg/*"]\n  },\n  "actions": [\n    { "type": 1 }\n  ],\n  "enabled": true\n}`,
  },
  {
    id: "create-event",
    category: "guilds",
    title: "Create scheduled event",
    method: "POST",
    path: "/guilds/{guild.id}/scheduled-events",
    description: "Create a guild scheduled event.",
    body: `{\n  "name": "Community Meetup",\n  "privacy_level": 2,\n  "scheduled_start_time": "2026-08-20T18:00:00.000Z",\n  "entity_type": 2,\n  "channel_id": "123456789012345678"\n}`,
  },
  {
    id: "get-template",
    category: "guilds",
    title: "Get guild template",
    method: "GET",
    path: "/guilds/templates/{template.code}",
    description: "Fetch a guild template by code (public).",
    body: null,
    noBotAuth: true,
  },
];

function resolvePath(path, vars) {
  return path.replace(/\{([^}]+)\}/g, (_, key) => {
    const map = {
      "application.id": vars.applicationId || "{application.id}",
      "guild.id": vars.guildId || "{guild.id}",
      "channel.id": vars.channelId || "{channel.id}",
      "message.id": vars.messageId || "{message.id}",
      "webhook.id": vars.webhookId || "{webhook.id}",
      "webhook.token": vars.webhookToken || "{webhook.token}",
      "interaction.id": vars.interactionId || "{interaction.id}",
      "interaction.token": vars.interactionToken || "{interaction.token}",
      "template.code": vars.templateCode || "{template.code}",
    };
    return map[key] || `{${key}}`;
  });
}

export function buildCurl(entry, vars = {}) {
  const url = `https://discord.com/api/v10${resolvePath(entry.path, vars)}`;
  const lines = [`curl -X ${entry.method} "${url}"`];
  lines.push(`  -H "Content-Type: application/json"`);
  if (!entry.noBotAuth) {
    lines.push(`  -H "Authorization: Bot ${vars.token || "YOUR_BOT_TOKEN"}"`);
  }
  if (entry.body && entry.method !== "GET") {
    lines.push(`  -d '${entry.body.replace(/'/g, "'\\''")}'`);
  }
  return lines.join(" \\\n");
}

export function buildFetch(entry, vars = {}) {
  const url = `https://discord.com/api/v10${resolvePath(entry.path, vars)}`;
  const headers = {
    "Content-Type": "application/json",
  };
  if (!entry.noBotAuth) {
    headers.Authorization = `Bot ${vars.token || "YOUR_BOT_TOKEN"}`;
  }

  const opts = {
    method: entry.method,
    headers,
  };

  let bodyLine = "";
  if (entry.body && entry.method !== "GET") {
    bodyLine = `\n  body: JSON.stringify(${entry.body}),`;
  }

  return `await fetch(${JSON.stringify(url)}, {
  method: ${JSON.stringify(entry.method)},
  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, "\n  ")},${bodyLine}
});`;
}
