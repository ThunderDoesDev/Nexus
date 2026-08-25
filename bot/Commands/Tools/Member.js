const { baseEmbed, formatList } = require("../../Utils/ToolHelpers");

module.exports = {
  name: "member",
  description: "Show a member's effective permissions in a channel.",
  cooldowns: 3,
  usage: ["/tools member [user] [channel]"],
  disabled: false,
  permissions: {
    client: [],
    user: [],
    staff: { developers: false },
  },
  options: [
    {
      name: "target",
      description: "Member (defaults to you)",
      type: 6,
      required: false,
    },
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

      const user = interaction.options.getUser("target") || interaction.user;
      const channel =
        interaction.options.getChannel("channel") || interaction.channel;
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) {
        return interaction.reply({
          content: "That user is not in this server.",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      const perms = channel.permissionsFor(member);
      const list = perms ? perms.toArray() : [];
      const embed = baseEmbed(client, "Effective Perms")
        .setThumbnail(user.displayAvatarURL({ size: 128 }))
        .addFields(
          { name: "**Member**", value: `${member} (\`${member.id}\`)`, inline: true },
          { name: "**Channel**", value: `${channel}`, inline: true },
          {
            name: "**Administrator**",
            value: perms?.has(client.modules.discord.PermissionFlagsBits.Administrator)
              ? "`Yes`"
              : "`No`",
            inline: true,
          },
          { name: "**Permissions**", value: formatList(list) }
        );

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
