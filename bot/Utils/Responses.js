const getResponseTypes = (client) => {
    return {
        Reply: {
            color: client.modules.discord.Colors.Red,
            flags: client.modules.discord.MessageFlags.Ephemeral,
            sendMethod: 'Reply'
        },
        FollowUp: {
            color: client.modules.discord.Colors.Red,
            flags: client.modules.discord.MessageFlags.Ephemeral,
            sendMethod: 'FollowUp'
        },
        Channel: {
            color: client.modules.discord.Colors.Red,
            sendMethod: 'Send'
        }
    };
};
const RESPONSES = {
    Commands: {
        CommandInfo: {
            noCommandMatching: {
                title: 'No Command Matching',
                description: 'No command matching the provided name was found.',
                type: 'Reply'
            }
        }
    },
    Events: {
        InteractionCreate: {
            cmdOnCooldown: {
                title: 'Command On Cooldown',
                description: '{cmdName} is on cooldown. Please wait {time} seconds before using it again.',
                type: 'Reply'
            },
            cmdDisabled: {
                title: 'Command Disabled',
                description: '{cmdName} is currently disabled.',
                type: 'Reply'
            },
            maintenanceMode: {
                title: 'Maintenance Mode',
                description: '{botName} is currently in maintenance mode and locked to our support servers only.',
                type: 'Reply'   
            },
            noDeveloper: {
                title: 'No Developer',
                description: 'You are not a developer of {botName}.',
                type: 'Reply'
            },
            requiredUserPermissions: {
                title: 'Required Permissions',
                description: 'You must have the following permissions to execute this command: {permissions}',
                type: 'Reply'
            },
            requiredBotPermissions: {
                title: 'Required Permissions',
                description: 'The bot must have the following permissions to execute this command: {permissions}',
                type: 'Reply'
            }
        }
    },
    Errors: {
        Command: {
            error: {
                title: 'Error',
                description: 'An error occurred while executing the command: {error}',
                type: 'Reply'
            }
        }
    }
};

const createEmbed = (interaction, title, description, options = {}) => {
    const client = interaction.client;
    const {
        author = null,
            color = client.modules.discord.Colors.Red,
            footer = client.footer,
            fields = [],
            components = [],
            logo = null,
            asCodeBlock = true
    } = options;
    if (description && asCodeBlock) {
        description = `\`\`\`${description}\`\`\``;
    }
    const embed = new client.modules.discord.EmbedBuilder()
        .setTitle(title)
        .setDescription(description || 'No description provided.')
        .setColor(options.color || color)
        .setFooter({
            text: footer
        });
    if (author) embed.setAuthor({
        name: author
    });
    if (logo) embed.setThumbnail(logo);
    if (fields.length > 0) embed.addFields(...fields);
    return {
        embed,
        components
    };
}

const send = async (interaction, type, args = {}) => {
    try {
        const client = interaction.client;
        let responseConfig;
        if (type.includes('.')) {
            const path = type.split('.');
            responseConfig = RESPONSES;
            for (const key of path) {
                responseConfig = responseConfig[key];
                if (!responseConfig) return;
            }
        } else {
            for (const category of Object.values(RESPONSES)) {
                if (category[type]) {
                    responseConfig = category[type];
                    break;
                }
            }
        }
        if (!responseConfig) return;
        const {
            title,
            components = []
        } = responseConfig;
        let description = responseConfig.description;
        if (description && args) {
            Object.entries(args).forEach(([key, value]) => {
                description = description.replace(`{${key}}`, value);
            });
        }
        const responseType = responseConfig.type || 'Reply';
        const RESPONSE_TYPES = getResponseTypes(client);
        const settings = {
            ...RESPONSE_TYPES[responseType],
            ...args,
            components: components,
            color: responseConfig.color || RESPONSE_TYPES[responseType].color
        };
        const {
            embed,
            components: finalComponents
        } = createEmbed(interaction, title, description, settings);
        const messageOptions = {
            embeds: [embed],
            components: finalComponents.length > 0 ? finalComponents : [],
            flags: settings.flags
        };
        switch (settings.sendMethod) {
            case 'FollowUp':
                return interaction.followUp(messageOptions);
            case 'Reply':
                return interaction.reply(messageOptions);
            case 'Send':
                return interaction.channel.send(messageOptions);
            default:
                return interaction.reply(messageOptions);
        }
    } catch (error) {
        return client.errors(client, error.stack, interaction);
    }
}

module.exports = async (type, interaction, args) => {
    return send(interaction, type, args);
};