module.exports = {
    name: "uptime",
    description: "Displays the bot and server uptime information.",
    cooldowns: 3,
    usage: [],
    disabled: false,
    permissions: {
        client: [],
        user: [],
        staff: {
            developers: false
        }
    },
    run: async (client, interaction, args) => {
        try {
            const botUptimeSeconds = Math.floor(client.uptime / 1000);
            const serverUptimeSeconds = Math.floor(client.modules.os.uptime());
            const botUptimeTimestamp = Math.floor(Date.now() / 1000) - botUptimeSeconds;
            const serverUptimeTimestamp = Math.floor(Date.now() / 1000) - serverUptimeSeconds;
            const embed = new client.modules.discord.EmbedBuilder()
                .setTitle(`${client.settings.bot.name} • Uptime`)
                .addFields({
                    name: `**Bot Uptime:**`,
                    value: `<t:${botUptimeTimestamp}:R>`
                }, {
                    name: `**Server Uptime:**`,
                    value: `<t:${serverUptimeTimestamp}:R>`
                })
                .setColor(client.settings.bot.embedColor)
                .setThumbnail(client.user.displayAvatarURL({
                    dynamic: true
                }))
                .setFooter({
                    text: client.footer
                })
            return interaction.reply({
                embeds: [embed]
            });
        } catch (error) {
            return client.errors(client, error.stack, interaction, 'Command');
        }
    }
};