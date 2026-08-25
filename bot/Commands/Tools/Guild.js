const { decodeSnowflake, baseEmbed, truncate } = require("../../Utils/ToolHelpers");

module.exports = {
  name: "guild",
  description: "Look up this server or another guild the bot is in.",
  cooldowns: 3,
  usage: ["/tools guild [id]"],
  disabled: false,
  permissions: {
    client: [],
    user: [],
    staff: { developers: false },
  },
  options: [
    {
      name: "id",
      description: "Guild snowflake (defaults to this server)",
      type: 3,
      required: false,
    },
  ],
  run: async (client, interaction) => {
    try {
      const rawId = interaction.options.getString("id")?.trim();
      const id = rawId || interaction.guild?.id;
      if (!id) {
        return interaction.reply({
          content: "Provide a guild ID (or run this in a server).",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      const guild = await client.guilds.fetch(id).catch(() => null);
      if (!guild) {
        return interaction.reply({
          content: "Bot is not in that guild (or ID is invalid).",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      await guild.fetch().catch(() => null);
      const snowflake = decodeSnowflake(guild.id);
      const features = [...(guild.features || [])].slice(0, 40);
      const embed = baseEmbed(client, "Guild Lookup")
        .setThumbnail(guild.iconURL({ size: 256 }))
        .addFields(
          { name: "**Name**", value: truncate(guild.name, 256), inline: true },
          { name: "**ID**", value: `\`${guild.id}\``, inline: true },
          { name: "**Owner**", value: `<@${guild.ownerId}>`, inline: true },
          { name: "**Members**", value: `\`${guild.memberCount ?? "—"}\``, inline: true },
          { name: "**Channels**", value: `\`${guild.channels.cache.size}\``, inline: true },
          { name: "**Roles**", value: `\`${guild.roles.cache.size}\``, inline: true },
          {
            name: "**Created**",
            value: snowflake
              ? `<t:${Math.floor(snowflake.timestamp / 1000)}:F>`
              : "`Unknown`",
          },
          {
            name: "**Features**",
            value: features.length
              ? truncate(features.map((f) => `\`${f}\``).join(", "))
              : "`None`",
          }
        );

      if (guild.banner) {
        embed.setImage(guild.bannerURL({ size: 512 }));
      }

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
