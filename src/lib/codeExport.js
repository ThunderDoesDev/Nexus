/** Detect Discord JSON payloads and export discord.js / discord.py snippets. */

export const EXPORT_TARGETS = [
  { id: "djs", label: "discord.js" },
  { id: "dpy", label: "discord.py" },
];

export const EXAMPLE_PAYLOADS = {
  message: `{
  "content": "Hello from Nexus!",
  "embeds": [
    {
      "title": "Welcome",
      "description": "Exported from Nexus",
      "color": 5793266
    }
  ]
}`,
  command: `{
  "name": "ping",
  "description": "Replies with pong",
  "type": 1,
  "options": []
}`,
  interaction: `{
  "type": 4,
  "data": {
    "content": "Done!",
    "flags": 64
  }
}`,
  components: `{
  "components": [
    {
      "type": 1,
      "components": [
        {
          "type": 2,
          "style": 1,
          "label": "Click me",
          "custom_id": "nexus_btn"
        }
      ]
    }
  ]
}`,
};

function pretty(value) {
  return JSON.stringify(value, null, 2);
}

function indent(text, spaces = 2) {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line ? pad + line : line))
    .join("\n");
}

function detectKind(parsed) {
  if (Array.isArray(parsed)) {
    if (parsed.every((item) => item && typeof item === "object" && (item.title != null || item.description != null || item.fields || item.type === 1))) {
      if (parsed[0]?.type === 1 && parsed[0]?.components) return "components";
      return "embeds";
    }
    return "unknown";
  }

  if (!parsed || typeof parsed !== "object") return "unknown";

  if (typeof parsed.type === "number" && parsed.data && [1, 4, 5, 6, 7, 8, 9, 10, 12].includes(parsed.type)) {
    return "interaction";
  }

  if (
    parsed.name &&
    (parsed.description != null || [1, 2, 3].includes(parsed.type)) &&
    !parsed.content &&
    !parsed.embeds &&
    !parsed.components
  ) {
    return "command";
  }

  if (parsed.components && !parsed.content && !parsed.embeds && !parsed.poll && Object.keys(parsed).length <= 2) {
    return "components";
  }

  if (
    (parsed.title != null || parsed.description != null || parsed.fields || parsed.footer || parsed.author) &&
    !parsed.content &&
    !parsed.embeds &&
    !parsed.components
  ) {
    return "embed";
  }

  if (parsed.content != null || parsed.embeds || parsed.components || parsed.poll) {
    return "message";
  }

  return "unknown";
}

function normalize(parsed, kind) {
  if (kind === "embeds") return { embeds: parsed };
  if (kind === "embed") return { embeds: [parsed] };
  if (kind === "components" && Array.isArray(parsed)) return { components: parsed };
  return parsed;
}

function djsMessage(payload) {
  const lines = ["const payload = " + pretty(payload) + ";", "", "// Send with a messageable channel or interaction", "await channel.send(payload);", "// await interaction.reply(payload);"];
  return lines.join("\n");
}

function djsEmbed(payload) {
  const embeds = payload.embeds || [];
  if (embeds.length === 1) {
    return [
      "const { EmbedBuilder } = require('discord.js');",
      "",
      "const embed = EmbedBuilder.from(" + pretty(embeds[0]) + ");",
      "",
      "await channel.send({ embeds: [embed] });",
    ].join("\n");
  }
  return [
    "const { EmbedBuilder } = require('discord.js');",
    "",
    "const embeds = " + pretty(embeds) + ".map((data) => EmbedBuilder.from(data));",
    "",
    "await channel.send({ embeds });",
  ].join("\n");
}

function djsComponents(payload) {
  return [
    "const { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require('discord.js');",
    "",
    "// Raw component API shape — works with channel.send / interaction.reply",
    "const components = " + pretty(payload.components || payload) + ";",
    "",
    "await channel.send({ content: 'Choose an option', components });",
  ].join("\n");
}

function djsCommand(payload) {
  return [
    "// Register with the application commands API",
    "const command = " + pretty(payload) + ";",
    "",
    "await rest.put(",
    "  Routes.applicationCommands(CLIENT_ID),",
    "  { body: [command] },",
    ");",
    "",
    "// Or push into an existing commands array:",
    "// body: [...existing, command]",
  ].join("\n");
}

function djsInteraction(payload) {
  const type = payload.type;
  if (type === 1) {
    return "return res.send({ type: 1 }); // PONG";
  }
  if (type === 5) {
    return [
      "// Defer reply (thinking…)",
      "await interaction.deferReply(" +
        (payload.data?.flags ? `{ flags: ${payload.data.flags} }` : "") +
        ");",
    ].join("\n");
  }
  if (type === 6) {
    return "await interaction.deferUpdate();";
  }
  if (type === 8) {
    return [
      "await interaction.respond(",
      indent(pretty(payload.data?.choices || [])),
      ");",
    ].join("\n");
  }
  if (type === 9) {
    return [
      "const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js');",
      "",
      "// Using raw modal data from the Interactions API shape:",
      "await interaction.showModal(",
      "  ModalBuilder.from(" + pretty(payload.data) + ")",
      ");",
      "",
      "// HTTP / verify-signature endpoint alternative:",
      "// return res.send(" + pretty(payload) + ");",
    ].join("\n");
  }
  if (type === 7) {
    return [
      "await interaction.update(",
      indent(pretty(payload.data || {})),
      ");",
    ].join("\n");
  }
  return [
    "await interaction.reply(",
    indent(pretty(payload.data || {})),
    ");",
    "",
    "// HTTP endpoint alternative:",
    "// return res.send(" + pretty(payload) + ");",
  ].join("\n");
}

function dpyMessage(payload) {
  const hasEmbeds = Array.isArray(payload.embeds) && payload.embeds.length;
  const hasComponents = Array.isArray(payload.components) && payload.components.length;
  const lines = ["import discord", ""];

  if (hasEmbeds) {
    lines.push("embeds = [discord.Embed.from_dict(e) for e in " + pretty(payload.embeds) + "]");
  }
  if (hasComponents) {
    lines.push("view_payload = " + pretty(payload.components));
    lines.push("# Prefer building a discord.ui.View for interactive components in bots.");
  }

  const kwargs = [];
  if (payload.content) kwargs.push(`content=${JSON.stringify(payload.content)}`);
  if (hasEmbeds) kwargs.push("embeds=embeds");
  if (payload.flags) kwargs.push(`# flags=${payload.flags}`);

  lines.push("");
  lines.push(`await channel.send(${kwargs.join(", ") || "..."})`);
  if (hasComponents) {
    lines.push("# Pass components via a View, or use the HTTP API with the raw payload above.");
  }
  return lines.join("\n");
}

function dpyEmbed(payload) {
  const embeds = payload.embeds || [];
  if (embeds.length === 1) {
    return [
      "import discord",
      "",
      "embed = discord.Embed.from_dict(" + pretty(embeds[0]) + ")",
      "",
      "await channel.send(embed=embed)",
    ].join("\n");
  }
  return [
    "import discord",
    "",
    "embeds = [discord.Embed.from_dict(e) for e in " + pretty(embeds) + "]",
    "",
    "await channel.send(embeds=embeds)",
  ].join("\n");
}

function dpyComponents(payload) {
  return [
    "import discord",
    "",
    "components = " + pretty(payload.components || payload),
    "",
    "# discord.py prefers discord.ui.View for bots.",
    "# For raw HTTP / webhook-style payloads you can POST `components` as-is.",
    "await channel.send(content='Choose an option')  # attach a View in your bot code",
  ].join("\n");
}

function dpyCommand(payload) {
  return [
    "# App command JSON for bulk overwrite / REST registration",
    "command = " + pretty(payload),
    "",
    "# Example with discord.py tree (manual mirror):",
    "@bot.tree.command(name=" + JSON.stringify(payload.name || "command") + ", description=" + JSON.stringify(payload.description || "") + ")",
    "async def " + String(payload.name || "command").replace(/\W/g, "_") + "(interaction: discord.Interaction):",
    "    await interaction.response.send_message('ok')",
  ].join("\n");
}

function dpyInteraction(payload) {
  const type = payload.type;
  if (type === 1) return "return {'type': 1}  # PONG";
  if (type === 5) {
    return "await interaction.response.defer(" + (payload.data?.flags === 64 ? "ephemeral=True" : "") + ")";
  }
  if (type === 6) return "await interaction.response.defer(thinking=False)  # component defer / deferUpdate equivalent";
  if (type === 8) {
    return [
      "choices = [",
      ...(payload.data?.choices || []).map(
        (c) => `    discord.app_commands.Choice(name=${JSON.stringify(c.name)}, value=${JSON.stringify(c.value)}),`
      ),
      "]",
      "await interaction.response.autocomplete(choices)",
    ].join("\n");
  }
  if (type === 9) {
    return [
      "# Modal via HTTP callback shape:",
      "payload = " + pretty(payload),
      "",
      "# Or build discord.ui.Modal in your bot and:",
      "# await interaction.response.send_modal(MyModal())",
    ].join("\n");
  }
  if (type === 7) {
    return [
      "await interaction.response.edit_message(",
      payload.data?.content ? `    content=${JSON.stringify(payload.data.content)},` : "    # content=...",
      ")",
    ].join("\n");
  }
  const data = payload.data || {};
  const args = [];
  if (data.content) args.push(`content=${JSON.stringify(data.content)}`);
  if (data.flags === 64) args.push("ephemeral=True");
  return `await interaction.response.send_message(${args.join(", ") || "..."})`;
}

export function exportCode(raw, target = "djs") {
  let parsed;
  try {
    parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return { error: "Invalid JSON — fix syntax and try again." };
  }

  const kind = detectKind(parsed);
  if (kind === "unknown") {
    return {
      error: "Unrecognized payload. Paste a message, embed, components, slash command, or interaction response.",
      kind,
    };
  }

  const payload = normalize(parsed, kind);
  let code = "";

  if (target === "djs") {
    if (kind === "message") code = djsMessage(payload);
    else if (kind === "embed" || kind === "embeds") code = djsEmbed(payload);
    else if (kind === "components") code = djsComponents(payload);
    else if (kind === "command") code = djsCommand(payload);
    else if (kind === "interaction") code = djsInteraction(payload);
  } else {
    if (kind === "message") code = dpyMessage(payload);
    else if (kind === "embed" || kind === "embeds") code = dpyEmbed(payload);
    else if (kind === "components") code = dpyComponents(payload);
    else if (kind === "command") code = dpyCommand(payload);
    else if (kind === "interaction") code = dpyInteraction(payload);
  }

  return { kind, code, target };
}

export function kindLabel(kind) {
  return (
    {
      message: "Message",
      embed: "Embed",
      embeds: "Embeds",
      components: "Components",
      command: "Slash command",
      interaction: "Interaction response",
    }[kind] || kind
  );
}
