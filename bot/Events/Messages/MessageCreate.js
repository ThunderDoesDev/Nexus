module.exports.run = async (client, message, args) => {
    try {
        if (message.content === `<@${client.user.id}>` || message.content === `<@!${client.user.id}>`) {
            if (!message.author.bot) {
                const components = [];
                const supportUrl = client.settings.bot.supportGuild;
                if (supportUrl && /^https?:\/\//.test(supportUrl) && supportUrl !== 'https://discord.gg/') {
                    const supportButton = new client.modules.discord.ButtonBuilder()
                        .setURL(supportUrl)
                        .setLabel('Support Server')
                        .setStyle(client.modules.discord.ButtonStyle.Link);
                    components.push(new client.modules.discord.ActionRowBuilder().addComponents(supportButton));
                }
                const embed = new client.modules.discord.EmbedBuilder()
                    .setTitle(`Hello there, I'm ${client.user.username}.`)
                    .setDescription("I am your assistant, how can I help you today?")
                    .addFields({
                        name: `**Commands:**`,
                        value: `Use /help to see all commands.`
                    })
                    .setColor(client.settings.bot.embedColor)
                    .setFooter({
                        text: client.footer
                    })
                    .setThumbnail(client.user.displayAvatarURL({
                        dynamic: true
                    }))
                    .setTimestamp();
                return message.reply({
                    embeds: [embed],
                    components
                });
            }
        }
    } catch (error) {
        return client.errors(client, error.stack, message, 'Event');
    }
};