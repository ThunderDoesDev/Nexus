const { baseEmbed } = require("../../Utils/ToolHelpers");

module.exports = {
  name: "limits",
  description: "Show common Discord hard limits.",
  cooldowns: 3,
  usage: ["/tools limits"],
  disabled: false,
  permissions: {
    client: [],
    user: [],
    staff: { developers: false },
  },
  options: [],
  run: async (client, interaction) => {
    try {
      const embed = baseEmbed(client, "Limits")
        .setDescription("Common Discord API hard limits (from the Nexus toolkit).")
        .addFields(
          {
            name: "**Messages**",
            value: [
              "`content` 2000",
              "`embeds` 10",
              "`embed total chars` 6000",
              "`action rows` 5",
            ].join("\n"),
          },
          {
            name: "**Embed**",
            value: [
              "`title` 256",
              "`description` 4096",
              "`fields` 25",
              "`field name/value` 256 / 1024",
              "`footer` 2048",
            ].join("\n"),
          },
          {
            name: "**Commands**",
            value: [
              "`name` 32",
              "`description` 100",
              "`options` 25",
              "`choices` 25",
            ].join("\n"),
          },
          {
            name: "**Polls**",
            value: [
              "`question` 300",
              "`answers` 2–10",
              "`answer text` 55",
              "`duration` 1–768h",
            ].join("\n"),
          }
        );

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
