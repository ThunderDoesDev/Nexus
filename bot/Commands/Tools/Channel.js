const { baseEmbed, decodeSnowflake } = require("../../Utils/ToolHelpers");

module.exports = {
  name: "channel",
  description: "Inspect a channel in this server.",
  cooldowns: 3,
  usage: ["/tools channel [channel]"],
  disabled: false,
  permissions: {
    client: [],
    user: [],
    staff: { developers: false },
  },
  options: [
    {
      name: "channel",
      description: "Channel (defaults to current)",
      type: 7,
      required: false,
    },
  ],
  run: async (client, interaction) => {
    try {
      if (!interaction.guild) {
        return interaction.reply({
          content: "This command only works in a server.",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      const channel = interaction.options.getChannel("channel") || interaction.channel;
      const snowflake = decodeSnowflake(channel.id);
      const typeName =
        Object.keys(client.modules.discord.ChannelType).find(
          (k) => client.modules.discord.ChannelType[k] === channel.type
        ) || String(channel.type);

      const embed = baseEmbed(client, "Channel Info").addFields(
        { name: "**Name**", value: `${channel}`, inline: true },
        { name: "**ID**", value: `\`${channel.id}\``, inline: true },
        { name: "**Type**", value: `\`${typeName}\``, inline: true },
        {
          name: "**Parent**",
          value: channel.parent ? `${channel.parent}` : "`None`",
          inline: true,
        },
        {
          name: "**Created**",
          value: snowflake
            ? `<t:${Math.floor(snowflake.timestamp / 1000)}:F>`
            : "`Unknown`",
        },
        {
          name: "**Topic**",
          value: channel.topic ? channel.topic.slice(0, 1024) : "`None`",
        }
      );

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
