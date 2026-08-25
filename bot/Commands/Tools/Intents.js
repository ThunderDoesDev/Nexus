const { baseEmbed, formatList, parseBitfield, INTENTS } = require("../../Utils/ToolHelpers");

module.exports = {
  name: "intents",
  description: "Decode a Discord gateway intents bitfield.",
  cooldowns: 3,
  usage: ["/tools intents <bitfield>"],
  disabled: false,
  permissions: {
    client: [],
    user: [],
    staff: { developers: false },
  },
  options: [
    {
      name: "bitfield",
      description: "Intents integer / bitfield",
      type: 3,
      required: true,
    },
  ],
  run: async (client, interaction) => {
    try {
      const raw = interaction.options.getString("bitfield").trim();
      let value;
      try {
        value = BigInt(raw);
      } catch {
        return interaction.reply({
          content: "Invalid bitfield. Use a numeric intents integer.",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      const flags = parseBitfield(value, INTENTS);
      const embed = baseEmbed(client, "Gateway Intents")
        .addFields(
          { name: "**Bitfield**", value: `\`${value.toString()}\`` },
          { name: "**Count**", value: `\`${flags.length}\``, inline: true },
          { name: "**Intents**", value: formatList(flags) }
        );

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
