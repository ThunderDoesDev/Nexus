const { baseEmbed, truncate } = require("../../Utils/ToolHelpers");

module.exports = {
  name: "invite",
  description: "Resolve a Discord invite code or URL.",
  cooldowns: 3,
  usage: ["/tools invite <code>"],
  disabled: false,
  permissions: {
    client: [],
    user: [],
    staff: { developers: false },
  },
  options: [
    {
      name: "code",
      description: "Invite code or discord.gg URL",
      type: 3,
      required: true,
    },
  ],
  run: async (client, interaction) => {
    try {
      let code = interaction.options.getString("code").trim();
      code = code
        .replace(/^https?:\/\/(www\.)?(discord\.gg|discord(?:app)?\.com\/invite)\//i, "")
        .split(/[/?#]/)[0];

      const invite = await client.fetchInvite(code, { withCounts: true }).catch(() => null);
      if (!invite) {
        return interaction.reply({
          content: "Could not resolve that invite.",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      const guild = invite.guild;
      const embed = baseEmbed(client, "Invite Lookup")
        .setThumbnail(guild?.iconURL({ size: 256 }) || null)
        .addFields(
          { name: "**Code**", value: `\`${invite.code}\``, inline: true },
          { name: "**Channel**", value: invite.channel ? `#${invite.channel.name}` : "`—`", inline: true },
          { name: "**Expires**", value: invite.expiresAt ? `<t:${Math.floor(invite.expiresAt.getTime() / 1000)}:R>` : "`Never`", inline: true },
          { name: "**Guild**", value: guild ? truncate(guild.name) : "`Group DM / unknown`", inline: true },
          { name: "**Guild ID**", value: guild ? `\`${guild.id}\`` : "`—`", inline: true },
          {
            name: "**Members**",
            value: `\`${invite.memberCount ?? "—"}\` · Online \`${invite.presenceCount ?? "—"}\``,
            inline: true,
          }
        );

      if (invite.inviter) {
        embed.addFields({
          name: "**Inviter**",
          value: `\`${invite.inviter.tag}\` (\`${invite.inviter.id}\`)`,
        });
      }

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
