module.exports.run = async (client, interaction, args) => {
  try {
    let clientDB = null;
    if (client.database?.ready) {
      try {
        clientDB = await client.database.models.Client.findOne({
          client_id: client.user.id,
        });
      } catch {
        clientDB = null;
      }
    }

    if (
      interaction.type ===
        client.modules.discord.InteractionType.ApplicationCommandAutocomplete &&
      !interaction.user.bot
    ) {
      let subCmd = null;
      let cmd = null;
      let commandKey = null;
      try {
        subCmd = interaction.options.getSubcommand(false);
      } catch {
        // no subcommand
      }
      if (subCmd) {
        commandKey = `${interaction.commandName}-${subCmd}`;
        cmd = client.slash.get(commandKey);
      } else {
        commandKey = interaction.commandName.toLowerCase();
        cmd = client.slash.get(commandKey);
      }
      if (!cmd || !cmd.autocomplete) {
        return;
      }
      return cmd.autocomplete(client, interaction, args);
    }

    if (
      interaction.type ===
        client.modules.discord.InteractionType.ApplicationCommand &&
      !interaction.user.bot
    ) {
      const developerIds = Array.isArray(client.settings.bot.developer)
        ? client.settings.bot.developer
        : [client.settings.bot.developer];
      const memberId = interaction.member?.id || interaction.user.id;
      const isDeveloper = developerIds.includes(memberId);

      if (client.settings.bot.maintenanceMode === true && !isDeveloper) {
        if (interaction.guild) {
          const ourGuilds = client.settings.bot.ourGuilds || [];
          if (!ourGuilds.includes(interaction.guild.id)) {
            return client.responses(
              "Events.InteractionCreate.maintenanceMode",
              interaction,
              {
                botName: client.user.username,
              }
            );
          }
        } else {
          return client.responses(
            "Events.InteractionCreate.maintenanceMode",
            interaction,
            {
              botName: client.user.username,
            }
          );
        }
      }

      let subCmd = null;
      let cmd = null;
      let commandKey = null;
      try {
        subCmd = interaction.options.getSubcommand(false);
      } catch {
        // no subcommand
      }
      if (subCmd) {
        commandKey = `${interaction.commandName}-${subCmd}`;
        cmd = client.slash.get(commandKey);
      } else {
        commandKey = interaction.commandName.toLowerCase();
        cmd = client.slash.get(commandKey);
      }
      if (!cmd) {
        return client.responses(
          "Commands.CommandInfo.noCommandMatching",
          interaction
        );
      }

      if (!isDeveloper) {
        const now = Date.now();
        const cooldownAmount = Math.floor(cmd.cooldowns || 3) * 1000;
        if (!client.cooldowns.has(cmd.name)) {
          client.cooldowns.set(cmd.name, new Map());
        }
        const timestamps = client.cooldowns.get(cmd.name);
        if (timestamps.has(memberId)) {
          const expirationTime = timestamps.get(memberId) + cooldownAmount;
          if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            if (timeLeft > 0.9) {
              return client.responses(
                "Events.InteractionCreate.cmdOnCooldown",
                interaction,
                {
                  cmdName: cmd.name,
                  time: timeLeft.toFixed(1),
                }
              );
            }
          }
        }
        timestamps.set(memberId, now);
        setTimeout(() => timestamps.delete(memberId), cooldownAmount);
      }

      if (cmd.disabled === true && !isDeveloper) {
        return client.responses(
          "Events.InteractionCreate.cmdDisabled",
          interaction,
          {
            cmdName: cmd.name,
          }
        );
      }

      const fetchChannel =
        client.channels.cache.find(
          (chan) => chan.id === client.settings.channels.commands
        ) || null;
      if (fetchChannel && interaction.guild) {
        const embed = new client.modules.discord.EmbedBuilder()
          .setTitle(`${interaction.guild.name} • Slash Used`)
          .addFields(
            {
              name: "**Slash Used:**",
              value: subCmd
                ? `/${interaction.commandName} ${subCmd}`
                : `/${interaction.commandName}`,
            },
            {
              name: "**Command Type:**",
              value: subCmd
                ? `Category: ${interaction.commandName} | Subcommand: ${subCmd}`
                : "Standalone",
            },
            {
              name: "**Guild ID:**",
              value: interaction.guild.id,
            },
            {
              name: "**Guild Name:**",
              value: interaction.guild.name,
            },
            {
              name: "**Channel ID:**",
              value: interaction.channel.id,
            },
            {
              name: "**Channel Name:**",
              value: interaction.channel.name,
            },
            {
              name: "**User:**",
              value: `${interaction.user.username} (${interaction.user.id})`,
            }
          )
          .setColor(client.settings.bot.embedColor)
          .setFooter({
            text: client.footer,
          })
          .setThumbnail(
            client.user.displayAvatarURL({
              dynamic: true,
            })
          )
          .setTimestamp();
        await fetchChannel.send({
          embeds: [embed],
        });
      }

      if (cmd.permissions?.user && cmd.permissions.user.length > 0) {
        const missingUserPerms = cmd.permissions.user.filter(
          (perm) => !interaction.member.permissions.has(perm)
        );
        if (missingUserPerms.length > 0) {
          const permNames = missingUserPerms.map((perm) => {
            const permName = Object.keys(
              client.modules.discord.PermissionsBitField.Flags
            ).find(
              (key) =>
                client.modules.discord.PermissionsBitField.Flags[key] === perm
            );
            return permName || "Unknown Permission";
          });
          return client.responses(
            "Events.InteractionCreate.requiredUserPermissions",
            interaction,
            {
              commandName: cmd.name,
              permissions: permNames.join(", "),
            }
          );
        }
      }

      if (cmd.permissions?.client && cmd.permissions.client.length > 0) {
        const missingBotPerms = cmd.permissions.client.filter(
          (perm) => !interaction.guild.members.me.permissions.has(perm)
        );
        if (missingBotPerms.length > 0) {
          const permNames = missingBotPerms.map((perm) => {
            const permName = Object.keys(
              client.modules.discord.PermissionsBitField.Flags
            ).find(
              (key) =>
                client.modules.discord.PermissionsBitField.Flags[key] === perm
            );
            return permName || "Unknown Permission";
          });
          return client.responses(
            "Events.InteractionCreate.requiredBotPermissions",
            interaction,
            {
              commandName: cmd.name,
              permissions: permNames.join(", "),
              botName: client.user.username,
            }
          );
        }
      }

      if (cmd.permissions?.staff?.developers && !isDeveloper) {
        return client.responses(
          "Events.InteractionCreate.noDeveloper",
          interaction,
          {
            cmdName: cmd.name,
            botName: client.user.username,
          }
        );
      }

      if (
        clientDB?.maintenance_mode &&
        !isDeveloper &&
        interaction.guild &&
        !(client.settings.bot.ourGuilds || []).includes(interaction.guild.id)
      ) {
        return client.responses(
          "Events.InteractionCreate.maintenanceMode",
          interaction,
          {
            botName: client.user.username,
          }
        );
      }

      try {
        if (client.database?.ready) {
          client.database.models.Client.updateCommandsCount(
            client.user.id
          ).catch(() => {});
        }
        cmd.run(client, interaction, args);
      } catch (error) {
        return client.errors(client, error.stack, interaction, "Event");
      }
    }
  } catch (error) {
    return client.errors(client, error.stack, interaction, "Event");
  }
};
