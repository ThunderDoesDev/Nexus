const {
  decodeSnowflake,
  baseEmbed,
} = require("../../Utils/ToolHelpers");

module.exports = {
  name: "snowflake",
  description: "Decode a Discord snowflake ID.",
  cooldowns: 3,
  usage: ["/tools snowflake <id>"],
  disabled: false,
  permissions: {
    client: [],
    user: [],
    staff: { developers: false },
  },
  options: [
    {
      name: "id",
      description: "Snowflake ID to decode",
      type: 3,
      required: true,
    },
  ],
  run: async (client, interaction) => {
    try {
      const id = interaction.options.getString("id");
      const decoded = decodeSnowflake(id);
      if (!decoded) {
        return interaction.reply({
          content: "Invalid snowflake. Use a 17–20 digit Discord ID.",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      const embed = baseEmbed(client, "Snowflake")
        .setDescription("Decoded Discord snowflake.")
        .addFields(
          { name: "**ID**", value: `\`${decoded.id}\``, inline: true },
          { name: "**Created**", value: `<t:${Math.floor(decoded.timestamp / 1000)}:F>`, inline: true },
          { name: "**Relative**", value: `<t:${Math.floor(decoded.timestamp / 1000)}:R>`, inline: true },
          { name: "**Worker**", value: `\`${decoded.workerId}\``, inline: true },
          { name: "**Process**", value: `\`${decoded.processId}\``, inline: true },
          { name: "**Increment**", value: `\`${decoded.increment}\``, inline: true }
        );

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
