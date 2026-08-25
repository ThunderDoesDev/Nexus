const { baseEmbed, formatList, parseBitfield, USER_FLAGS } = require("../../Utils/ToolHelpers");

module.exports = {
  name: "flags",
  description: "Decode Discord user public flags.",
  cooldowns: 3,
  usage: ["/tools flags <bitfield>"],
  disabled: false,
  permissions: {
    client: [],
    user: [],
    staff: { developers: false },
  },
  options: [
    {
      name: "bitfield",
      description: "User flags bitfield",
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
          content: "Invalid bitfield.",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      const flags = parseBitfield(value, USER_FLAGS);
      const embed = baseEmbed(client, "User Flags")
        .addFields(
          { name: "**Bitfield**", value: `\`${value.toString()}\`` },
          { name: "**Flags**", value: formatList(flags) }
        );

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
