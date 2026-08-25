const { baseEmbed } = require("../../Utils/ToolHelpers");

module.exports = {
  name: "oauth",
  description: "Build a Discord OAuth2 bot invite URL.",
  cooldowns: 3,
  usage: ["/tools oauth [permissions] [scopes]"],
  disabled: false,
  permissions: {
    client: [],
    user: [],
    staff: { developers: false },
  },
  options: [
    {
      name: "client_id",
      description: "Application client ID (defaults to this bot)",
      type: 3,
      required: false,
    },
    {
      name: "permissions",
      description: "Permission bitfield (default 8 = Administrator)",
      type: 3,
      required: false,
    },
    {
      name: "scopes",
      description: "Space-separated scopes",
      type: 3,
      required: false,
    },
    {
      name: "guild_id",
      description: "Pre-select a guild ID",
      type: 3,
      required: false,
    },
  ],
  run: async (client, interaction) => {
    try {
      const clientId =
        interaction.options.getString("client_id")?.trim() ||
        client.settings.bot.id ||
        client.user.id;
      const permissions = interaction.options.getString("permissions")?.trim() || "8";
      const scopes =
        interaction.options.getString("scopes")?.trim() || "bot applications.commands";
      const guildId = interaction.options.getString("guild_id")?.trim();

      if (!/^\d{17,20}$/.test(clientId)) {
        return interaction.reply({
          content: "Invalid client ID.",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      const params = new URLSearchParams({
        client_id: clientId,
        permissions,
        scope: scopes,
      });
      if (guildId) params.set("guild_id", guildId);

      const url = `https://discord.com/oauth2/authorize?${params.toString()}`;
      const embed = baseEmbed(client, "OAuth Invite")
        .setDescription(`[Open invite URL](${url})`)
        .addFields(
          { name: "**Client ID**", value: `\`${clientId}\``, inline: true },
          { name: "**Permissions**", value: `\`${permissions}\``, inline: true },
          { name: "**Scopes**", value: `\`${scopes}\`` },
          { name: "**URL**", value: url }
        );

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
