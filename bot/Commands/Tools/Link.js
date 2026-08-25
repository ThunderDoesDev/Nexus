const { baseEmbed, parseMessageLink, buildMessageLink } = require("../../Utils/ToolHelpers");

module.exports = {
  name: "link",
  description: "Parse or build a Discord message jump link.",
  cooldowns: 3,
  usage: ["/tools link"],
  disabled: false,
  permissions: {
    client: [],
    user: [],
    staff: { developers: false },
  },
  options: [
    {
      name: "url",
      description: "Message link to parse",
      type: 3,
      required: false,
    },
    {
      name: "guild_id",
      description: "Guild ID (or @me) when building",
      type: 3,
      required: false,
    },
    {
      name: "channel_id",
      description: "Channel ID when building",
      type: 3,
      required: false,
    },
    {
      name: "message_id",
      description: "Message ID when building",
      type: 3,
      required: false,
    },
  ],
  run: async (client, interaction) => {
    try {
      const url = interaction.options.getString("url");
      const guildId = interaction.options.getString("guild_id");
      const channelId = interaction.options.getString("channel_id");
      const messageId = interaction.options.getString("message_id");

      if (url?.trim()) {
        const parsed = parseMessageLink(url);
        if (!parsed) {
          return interaction.reply({
            content: "Could not parse that Discord message link.",
            flags: client.modules.discord.MessageFlags.Ephemeral,
          });
        }
        const embed = baseEmbed(client, "Message Links")
          .setDescription("Parsed jump URL.")
          .addFields(
            { name: "**Guild**", value: `\`${parsed.guildId}\``, inline: true },
            { name: "**Channel**", value: `\`${parsed.channelId}\``, inline: true },
            { name: "**Message**", value: parsed.messageId ? `\`${parsed.messageId}\`` : "`—`", inline: true },
            { name: "**DM link**", value: parsed.isDm ? "`Yes`" : "`No`", inline: true }
          );
        return interaction.reply({ embeds: [embed] });
      }

      if (!channelId) {
        return interaction.reply({
          content: "Provide a message `url` to parse, or `channel_id` (+ optional guild/message) to build.",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      const built = buildMessageLink({
        guildId: guildId || interaction.guild?.id || "@me",
        channelId,
        messageId,
      });

      const embed = baseEmbed(client, "Message Links")
        .setDescription("Built jump URL.")
        .addFields({ name: "**Link**", value: built });

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
