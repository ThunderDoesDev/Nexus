const { baseEmbed, hexToDecimal } = require("../../Utils/ToolHelpers");

module.exports = {
  name: "embed",
  description: "Send a simple embed (website Embed Builder lite).",
  cooldowns: 5,
  usage: ["/tools embed <title> <description>"],
  disabled: false,
  permissions: {
    client: ["EmbedLinks", "SendMessages"],
    user: ["ManageMessages"],
    staff: { developers: false },
  },
  options: [
    {
      name: "title",
      description: "Embed title",
      type: 3,
      required: true,
    },
    {
      name: "description",
      description: "Embed description",
      type: 3,
      required: true,
    },
    {
      name: "color",
      description: "Hex color (#5865F2)",
      type: 3,
      required: false,
    },
    {
      name: "channel",
      description: "Channel to send to (defaults to current)",
      type: 7,
      required: false,
    },
    {
      name: "ephemeral",
      description: "Reply privately instead of sending to a channel",
      type: 5,
      required: false,
    },
  ],
  run: async (client, interaction) => {
    try {
      const title = interaction.options.getString("title").slice(0, 256);
      const description = interaction.options.getString("description").slice(0, 4096);
      const colorRaw = interaction.options.getString("color");
      const ephemeral = interaction.options.getBoolean("ephemeral") || false;
      const channel =
        interaction.options.getChannel("channel") || interaction.channel;

      let color = client.settings.bot.embedColor;
      if (colorRaw) {
        const decimal = hexToDecimal(colorRaw);
        if (decimal == null) {
          return interaction.reply({
            content: "Invalid color. Use hex like #5865F2.",
            flags: client.modules.discord.MessageFlags.Ephemeral,
          });
        }
        color = decimal;
      }

      const embed = new client.modules.discord.EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setFooter({ text: client.footer });

      if (ephemeral) {
        return interaction.reply({
          embeds: [embed],
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      if (!channel?.isTextBased?.()) {
        return interaction.reply({
          content: "Pick a text channel to send the embed.",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      await channel.send({ embeds: [embed] });
      return interaction.reply({
        content: `Embed sent in ${channel}.`,
        flags: client.modules.discord.MessageFlags.Ephemeral,
      });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
