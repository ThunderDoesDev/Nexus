const { baseEmbed, formatList, parseBitfield, PERMISSIONS } = require("../../Utils/ToolHelpers");

module.exports = {
  name: "permissions",
  description: "Decode a Discord permission bitfield.",
  cooldowns: 3,
  usage: ["/tools permissions <bitfield>"],
  disabled: false,
  permissions: {
    client: [],
    user: [],
    staff: { developers: false },
  },
  options: [
    {
      name: "bitfield",
      description: "Permission integer / bitfield",
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
          content: "Invalid bitfield. Use a numeric permission integer.",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      const flags = parseBitfield(value, PERMISSIONS);
      const embed = baseEmbed(client, "Perm Decoder")
        .setDescription("Parsed permission flags from bitfield.")
        .addFields(
          { name: "**Bitfield**", value: `\`${value.toString()}\`` },
          { name: "**Hex**", value: `\`0x${value.toString(16)}\``, inline: true },
          { name: "**Count**", value: `\`${flags.length}\``, inline: true },
          { name: "**Permissions**", value: formatList(flags) }
        );

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
