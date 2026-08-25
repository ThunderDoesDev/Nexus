async function updateStatus(client) {
  const statuses = [
    `${client.users.cache.size} Users`,
    `${client.guilds.cache.size} Guilds`,
    `/help`,
  ];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  client.user.setPresence({
    activities: [
      {
        name: status,
        state: status,
        type: client.modules.discord.ActivityType.Custom,
      },
    ],
    status: "online",
  });
}

module.exports.run = async (client) => {
  try {
    client.handlers.loadSlashCommands(client);
    await updateStatus(client);
    setInterval(() => updateStatus(client), 100000);

    await client.database.start(client);

    if (client.database.ready) {
      const clientDB = await client.database.models.Client.findOne({
        client_id: client.user.id,
      });
      if (!clientDB) {
        await client.database.models.Client.create({
          client_id: client.user.id,
          client_name: client.user.username,
          commands_used: 0,
          maintenance_mode: false,
          debug_mode: false,
        });
      }
    }

    const isLastShard =
      !client.shard ||
      client.shard.ids.includes(client.shard.count - 1);

    if (!isLastShard) return;

    let totalGuilds = client.guilds.cache.size;
    let totalMembers = client.users.cache.size;

    if (client.shard) {
      const resultG = await client.shard.broadcastEval(
        (c) => c.guilds.cache.size
      );
      const memberNum = await client.shard.broadcastEval(
        (c) => c.users.cache.size
      );
      totalGuilds = resultG.reduce((prev, guildCount) => prev + guildCount, 0);
      totalMembers = memberNum.reduce(
        (prev, memberCount) => prev + memberCount,
        0
      );
    }

    const journalChannel =
      client.channels.cache.find(
        (chan) => chan.id === client.settings.channels.journal
      ) || null;

    if (journalChannel) {
      const embed = new client.modules.discord.EmbedBuilder()
        .setTitle(`${client.user.username} • Ready & Online`)
        .addFields(
          {
            name: "**Total Members:**",
            value: `${totalMembers}`,
          },
          {
            name: "**Total Guilds:**",
            value: `${totalGuilds}`,
          },
          {
            name: "**Shards:**",
            value: client.shard
              ? `${client.shard.ids.join(", ")}`
              : "Single process",
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
      await journalChannel.send({
        embeds: [embed],
      });
    }

    client.logger.log("WHO AM I", `Logged In As ${client.user.tag}`);
    client.logger.log(
      "STATS",
      `${totalGuilds} Guild${totalGuilds === 1 ? "" : "s"}, ${totalMembers} User${totalMembers === 1 ? "" : "s"}`
    );
    client.logger.log("CONNECTED", "Connected To Discord's V10 Gateway");
  } catch (error) {
    return client.errors(client, error.stack, null, "Event");
  }
};
