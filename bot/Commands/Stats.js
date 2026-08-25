module.exports = {
    name: "stats",
    description: "Displays the bot's statistics.",
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
            const embed = new client.modules.discord.EmbedBuilder()
                .setTitle(`${client.settings.bot.name} • Bot Stats`)
                .addFields({
                    name: `**Guilds:**`,
                    value: `\`${client.guilds.cache.size}\``,
                    inline: true
                }, {
                    name: `**Users:**`,
                    value: `\`${client.users.cache.size}\``,
                    inline: true
                }, {
                    name: `**Commands:**`,
                    value: `\`${client.slash.size}\``,
                    inline: true
                }, {
                    name: `**Websocket Ping:**`,
                    value: `\`${Math.round(client.ws.ping)}ms\``,
                    inline: true
                }, {
                    name: `**Latency:**`,
                    value: `\`${Date.now() - interaction.createdTimestamp}ms\``,
                    inline: true
                }, {
                    name: `**Uptime:**`,
                    value: `<t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`,
                    inline: true
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
