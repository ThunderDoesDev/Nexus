module.exports = {
    name: "help",
    description: "Sends you a detailed list of my commands.",
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
            const developerIds = Array.isArray(client.settings.bot.developer) ? client.settings.bot.developer : [client.settings.bot.developer];
            const isDeveloper = developerIds.includes(interaction.member.id);            
            const commandsByCategory = {};
            client.slash.forEach((command, key) => {
                if (command && command.name && command.category) {
                    if (command.permissions && command.permissions.staff && command.permissions.staff.developers && !isDeveloper) {
                        return;
                    }                    
                    const category = command.category;
                    if (!commandsByCategory[category]) {
                        commandsByCategory[category] = [];
                    }
                    commandsByCategory[category].push(command.name);
                }
            });
            const categorizedText = Object.keys(commandsByCategory)
                .filter(cat => commandsByCategory[cat].length > 0)
                .sort()
                .map(cat => {
                    const commands = commandsByCategory[cat];
                    const list = commands.length ? commands.map(cmd => `\`${cmd}\``).join(', ') : 'No commands available.';
                    return `**${cat.charAt(0).toUpperCase() + cat.slice(1)}:**\n${list}`;
                });            
            const allText = categorizedText.join('\n');
            const embed = new client.modules.discord.EmbedBuilder()
                .setTitle(`${client.settings.bot.name || client.user.username} • All Commands`)
                .setDescription(allText)
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
            return client.errors(client, error, interaction, 'Command');
        }
    }
};