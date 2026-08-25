const { baseEmbed, decodeSnowflake, formatList } = require("../../Utils/ToolHelpers");

module.exports = {
  name: "role",
  description: "Inspect a role in this server.",
  cooldowns: 3,
  usage: ["/tools role <role>"],
  disabled: false,
  permissions: {
    client: [],
    user: [],
    staff: { developers: false },
  },
  options: [
    {
      name: "role",
      description: "Role to inspect",
      type: 8,
      required: true,
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

      const role = interaction.options.getRole("role");
      const snowflake = decodeSnowflake(role.id);
      const perms = role.permissions.toArray();
      const embed = baseEmbed(client, "Role Info")
        .setColor(role.color || client.settings.bot.embedColor)
        .addFields(
          { name: "**Name**", value: role.name, inline: true },
          { name: "**ID**", value: `\`${role.id}\``, inline: true },
          { name: "**Members**", value: `\`${role.members.size}\``, inline: true },
          { name: "**Hoisted**", value: role.hoist ? "`Yes`" : "`No`", inline: true },
          { name: "**Mentionable**", value: role.mentionable ? "`Yes`" : "`No`", inline: true },
          { name: "**Position**", value: `\`${role.position}\``, inline: true },
          {
            name: "**Created**",
            value: snowflake
              ? `<t:${Math.floor(snowflake.timestamp / 1000)}:R>`
              : "`Unknown`",
          },
          { name: "**Permissions**", value: formatList(perms) },
          { name: "**Mention**", value: `\`${role}\`` }
        );

      return interaction.reply({
        embeds: [embed],
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
