const { baseEmbed, TIMESTAMP_STYLES } = require("../../Utils/ToolHelpers");

module.exports = {
  name: "timestamp",
  description: "Build a Discord timestamp markdown tag.",
  cooldowns: 3,
  usage: ["/tools timestamp [unix] [style]"],
  disabled: false,
  permissions: {
    client: [],
    user: [],
    staff: { developers: false },
  },
  options: [
    {
      name: "unix",
      description: "Unix seconds (defaults to now)",
      type: 3,
      required: false,
    },
    {
      name: "style",
      description: "Timestamp style",
      type: 3,
      required: false,
      choices: TIMESTAMP_STYLES,
    },
  ],
  run: async (client, interaction) => {
    try {
      const raw = interaction.options.getString("unix");
      const style = interaction.options.getString("style") || "f";
      let unix = Math.floor(Date.now() / 1000);
      if (raw?.trim()) {
        const n = Number(raw.trim());
        if (!Number.isFinite(n) || n < 0) {
          return interaction.reply({
            content: "Unix must be a non-negative number (seconds).",
            flags: client.modules.discord.MessageFlags.Ephemeral,
          });
        }
        unix = Math.floor(n > 1e12 ? n / 1000 : n);
      }

      const tag = `<t:${unix}:${style}>`;
      const embed = baseEmbed(client, "Timestamp")
        .setDescription("Discord timestamp markdown.")
        .addFields(
          { name: "**Unix**", value: `\`${unix}\``, inline: true },
          { name: "**Style**", value: `\`${style}\``, inline: true },
          { name: "**Preview**", value: tag },
          { name: "**Markdown**", value: `\`${tag}\`` }
        );

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
