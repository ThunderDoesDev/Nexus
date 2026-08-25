const { baseEmbed, hexToDecimal, decimalToHex } = require("../../Utils/ToolHelpers");

module.exports = {
  name: "color",
  description: "Convert Discord embed colors (hex ↔ decimal).",
  cooldowns: 3,
  usage: ["/tools color <value>"],
  disabled: false,
  permissions: {
    client: [],
    user: [],
    staff: { developers: false },
  },
  options: [
    {
      name: "value",
      description: "Hex (#5865F2) or decimal (5793266)",
      type: 3,
      required: true,
    },
  ],
  run: async (client, interaction) => {
    try {
      const value = interaction.options.getString("value").trim();
      let hex = null;
      let decimal = null;

      if (/^#?[0-9a-fA-F]{6}$/.test(value)) {
        hex = decimalToHex(hexToDecimal(value));
        decimal = hexToDecimal(value);
      } else if (/^\d+$/.test(value)) {
        hex = decimalToHex(value);
        decimal = parseInt(value, 10);
      }

      if (hex == null || decimal == null || Number.isNaN(decimal)) {
        return interaction.reply({
          content: "Provide a hex color (#RRGGBB) or decimal 0–16777215.",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      const rgb = {
        r: (decimal >> 16) & 255,
        g: (decimal >> 8) & 255,
        b: decimal & 255,
      };

      const embed = baseEmbed(client, "Color Converter")
        .setColor(decimal)
        .addFields(
          { name: "**Hex**", value: `\`${hex}\``, inline: true },
          { name: "**Decimal**", value: `\`${decimal}\``, inline: true },
          { name: "**RGB**", value: `\`${rgb.r}, ${rgb.g}, ${rgb.b}\``, inline: true }
        );

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
