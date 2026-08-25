module.exports = {
  name: "poll",
  description: "Create a Discord poll in a channel.",
  cooldowns: 5,
  usage: ["/tools poll <question> <answers>"],
  disabled: false,
  permissions: {
    client: ["SendPolls", "SendMessages"],
    user: ["SendPolls"],
    staff: { developers: false },
  },
  options: [
    {
      name: "question",
      description: "Poll question",
      type: 3,
      required: true,
    },
    {
      name: "answers",
      description: "Answers separated by | (2–10)",
      type: 3,
      required: true,
    },
    {
      name: "duration",
      description: "Duration in hours (1–768)",
      type: 4,
      required: false,
    },
    {
      name: "multiselect",
      description: "Allow multiple answers",
      type: 5,
      required: false,
    },
    {
      name: "channel",
      description: "Channel (defaults to current)",
      type: 7,
      required: false,
    },
  ],
  run: async (client, interaction) => {
    try {
      const question = interaction.options.getString("question").slice(0, 300);
      const answersRaw = interaction.options.getString("answers");
      const duration = Math.min(
        768,
        Math.max(1, interaction.options.getInteger("duration") || 24)
      );
      const allowMultiselect = interaction.options.getBoolean("multiselect") || false;
      const channel =
        interaction.options.getChannel("channel") || interaction.channel;

      const answers = answersRaw
        .split("|")
        .map((a) => a.trim())
        .filter(Boolean)
        .slice(0, 10);

      if (answers.length < 2) {
        return interaction.reply({
          content: "Provide at least 2 answers separated by `|`.",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      if (!channel?.isTextBased?.()) {
        return interaction.reply({
          content: "Pick a text channel for the poll.",
          flags: client.modules.discord.MessageFlags.Ephemeral,
        });
      }

      await channel.send({
        poll: {
          question: { text: question },
          answers: answers.map((text) => ({ poll_media: { text: text.slice(0, 55) } })),
          duration,
          allow_multiselect: allowMultiselect,
        },
      });

      return interaction.reply({
        content: `Poll posted in ${channel}.`,
        flags: client.modules.discord.MessageFlags.Ephemeral,
      });
    } catch (error) {
      return client.errors(client, error.stack, interaction, "Command");
    }
  },
};
