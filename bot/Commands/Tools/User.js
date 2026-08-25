const { decodeSnowflake, baseEmbed, formatList, parseBitfield, USER_FLAGS } = require("../../Utils/ToolHelpers");

module.exports = {
  name: "user",
  description: "Look up a Discord user by mention or snowflake.",
  cooldowns: 3,
  usage: ["/tools user <user>"],
  disabled: false,
  permissions: {
    client: [],
    user: [],
    staff: { developers: false },
  },
  options: [
    {
      name: "target",
      description: "User to look up",
      type: 6,
      required: false,
    },
    {
      name: "id",
      description: "User snowflake ID (if not using target)",
      type: 3,
      required: false,
    },
  ],
  run: async (client, interaction) => {
    try {
      const target = interaction.options.getUser("target");
      const rawId = interaction.options.getString("id");
      const id = target?.id || rawId?.trim();
      if (!id) {
        return interaction.reply({
          content: "Provide a user mention/target or a snowflake ID.",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      const user = target || (await client.users.fetch(id).catch(() => null));
      if (!user) {
        return interaction.reply({
          content: "Could not find that user.",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      const snowflake = decodeSnowflake(user.id);
      const flags = parseBitfield(user.flags?.bitfield ?? 0, USER_FLAGS);
      const embed = baseEmbed(client, "User Lookup")
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: "**Tag**", value: `\`${user.tag}\``, inline: true },
          { name: "**ID**", value: `\`${user.id}\``, inline: true },
          { name: "**Bot**", value: user.bot ? "`Yes`" : "`No`", inline: true },
          {
            name: "**Created**",
            value: snowflake
              ? `<t:${Math.floor(snowflake.timestamp / 1000)}:F> (<t:${Math.floor(snowflake.timestamp / 1000)}:R>)`
              : "`Unknown`",
          },
          { name: "**Flags**", value: formatList(flags) },
          {
            name: "**Avatar**",
            value: `[Open](${user.displayAvatarURL({ size: 4096 })})`,
          }
        );

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
