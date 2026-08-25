module.exports = {
    name: "ping",
    description: "Displays the bot's ping and latency information.",
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
                .setTitle(`${client.settings.bot.name} • Bot Ping`)
                .addFields({
                    name: `**Websocket Ping:**`,
                    value: `\`${Math.round(client.ws.ping)}ms\``,
                }, {
                    name: `**Latency:**`,
                    value: `\`${Date.now() - interaction.createdTimestamp}ms\``
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
