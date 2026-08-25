module.exports = {
    name: "debug",
    description: "Debug the bot's required permissions.",
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
            const permissions = {
                CreateInstantInvite: "Create Instant Invite",
                ViewAuditLog: "View Audit Log",
                ViewChannel: "View Channel",
                SendMessages: "Send Messages",
                EmbedLinks: "Embed Links",
                AttachFiles: "Attach Files",
                ReadMessageHistory: "Read Message History",
                AddReactions: "Add Reactions",
                UseApplicationCommands: "Use Application Commands"
            };
            const requiredPermissions = [
                client.modules.discord.PermissionsBitField.Flags.CreateInstantInvite,
                client.modules.discord.PermissionsBitField.Flags.ViewAuditLog,
                client.modules.discord.PermissionsBitField.Flags.ViewChannel,
                client.modules.discord.PermissionsBitField.Flags.SendMessages,
                client.modules.discord.PermissionsBitField.Flags.EmbedLinks,
                client.modules.discord.PermissionsBitField.Flags.AttachFiles,
                client.modules.discord.PermissionsBitField.Flags.ReadMessageHistory,
                client.modules.discord.PermissionsBitField.Flags.AddReactions,
                client.modules.discord.PermissionsBitField.Flags.UseApplicationCommands
            ];
            const botMember = interaction.guild.members.me;
            const botPermissions = interaction.channel.permissionsFor(botMember);
            const permissionsStatus = requiredPermissions.map(permission => {
                const hasPermission = botPermissions.has(permission);
                const permName = Object.keys(client.modules.discord.PermissionsBitField.Flags).find(
                    key => client.modules.discord.PermissionsBitField.Flags[key] === permission
                );
                const formattedPermName = permName ?
                    permissions[permName] ||
                    permName
                    .replace(/([A-Z])/g, ' $1')
                    .trim()
                    .replace(/_/g, ' ') :
                    "Unknown Permission";
                return `${hasPermission ? '<:yes:1452183820085366867> - ' : '<:no:1452183796903317524> - '} ${formattedPermName}`;
            });
            const embed = new client.modules.discord.EmbedBuilder()
                .setTitle(`${client.settings.bot.name} • Debug Permissions`)
                .setDescription(permissionsStatus.join('\n'))
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