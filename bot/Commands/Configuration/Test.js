module.exports = {
    name: "test",
    description: "Test command.",
    cooldowns: 3,
    usage: [],
    disabled: false,
    permissions: {
        client: [],
        user: ["ManageGuild"],
        staff: {
            developers: false
        }
    },
    run: async (client, interaction, args) => {
        try {
            const embed = new client.modules.discord.EmbedBuilder()
                .setTitle(`${client.settings.bot.name} • Configuration Test`)
                .setDescription("Configuration commands are working.")
                .setColor(client.settings.bot.embedColor)
                .setFooter({
                    text: client.footer
                })
            return interaction.reply({
                embeds: [embed],
                flags: client.modules.discord.MessageFlags.Ephemeral
            });
        } catch (error) {
            return client.errors(client, error.stack, interaction, 'Command');
        }
    }
};
