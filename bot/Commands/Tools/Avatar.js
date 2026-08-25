const { baseEmbed } = require("../../Utils/ToolHelpers");

module.exports = {
  name: "avatar",
  description: "Get CDN avatar URLs for a user.",
  cooldowns: 3,
  usage: ["/tools avatar [user]"],
  disabled: false,
  permissions: {
    client: [],
    user: [],
    staff: { developers: false },
  },
  options: [
    {
      name: "target",
      description: "User (defaults to you)",
      type: 6,
      required: false,
    },
    {
      name: "size",
      description: "CDN size",
      type: 3,
      required: false,
      choices: [
        { name: "128", value: "128" },
        { name: "256", value: "256" },
        { name: "512", value: "512" },
        { name: "1024", value: "1024" },
        { name: "4096", value: "4096" },
      ],
    },
  ],
  run: async (client, interaction) => {
    try {
      const user = interaction.options.getUser("target") || interaction.user;
      const size = Number(interaction.options.getString("size") || 1024);
      const png = user.displayAvatarURL({ extension: "png", size });
      const webp = user.displayAvatarURL({ extension: "webp", size });
      const gif = user.avatar?.startsWith("a_")
        ? user.displayAvatarURL({ extension: "gif", size })
        : null;

      const embed = baseEmbed(client, "CDN Assets")
        .setThumbnail(webp)
        .addFields(
          { name: "**User**", value: `\`${user.tag}\` (\`${user.id}\`)` },
          { name: "**PNG**", value: png },
          { name: "**WEBP**", value: webp },
          ...(gif ? [{ name: "**GIF**", value: gif }] : [])
        );

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
