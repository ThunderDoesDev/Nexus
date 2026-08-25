const { baseEmbed, buildMention } = require("../../Utils/ToolHelpers");

module.exports = {
  name: "mention",
  description: "Build a Discord mention string.",
  cooldowns: 3,
  usage: ["/tools mention <type> <id>"],
  disabled: false,
  permissions: {
    client: [],
    user: [],
    staff: { developers: false },
  },
  options: [
    {
      name: "type",
      description: "Mention type",
      type: 3,
      required: true,
      choices: [
        { name: "User", value: "user" },
        { name: "Channel", value: "channel" },
        { name: "Role", value: "role" },
        { name: "Slash command", value: "slash" },
        { name: "Emoji", value: "emoji" },
        { name: "Animated emoji", value: "animated" },
        { name: "@everyone", value: "everyone" },
        { name: "@here", value: "here" },
      ],
    },
    {
      name: "id",
      description: "Snowflake ID (when required)",
      type: 3,
      required: false,
    },
    {
      name: "name",
      description: "Name for slash/emoji mentions",
      type: 3,
      required: false,
    },
  ],
  run: async (client, interaction) => {
    try {
      const type = interaction.options.getString("type");
      const id = interaction.options.getString("id")?.trim() || "";
      const name = interaction.options.getString("name")?.trim() || "";

      if (!["everyone", "here"].includes(type) && !/^\d{17,20}$/.test(id)) {
        return interaction.reply({
          content: "Provide a valid snowflake ID for this mention type.",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      const mention = buildMention(type, id, name);
      const embed = baseEmbed(client, "Mentions")
        .addFields(
          { name: "**Type**", value: `\`${type}\``, inline: true },
          { name: "**Result**", value: mention },
          { name: "**Escaped**", value: `\`${mention}\`` }
        );

      return interaction.reply({
        embeds: [embed],
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
