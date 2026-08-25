const path = require("path");
const Discord = require("discord.js");

const BOT_ROOT = __dirname;
process.chdir(BOT_ROOT);

function loadSettings() {
  const nexus = require(path.join(__dirname, "..", "settings", "config.json"));
  const bot = nexus.bot || {};
  const clientId = String(nexus.clientId || bot.id || "");
  return {
    bot: {
      token: String(nexus.token || bot.token || "").trim(),
      id: clientId,
      name: bot.name || "Nexus",
      developer: bot.developer || [],
      supportGuild: bot.supportGuild || "https://discord.gg/",
      invite:
        bot.invite ||
        (clientId
          ? `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`
          : ""),
      vote: bot.vote || bot.invite || "",
      ourGuilds: bot.ourGuilds || [],
      embedColor: bot.embedColor || "#5865F2",
      maintenanceMode: Boolean(bot.maintenanceMode),
    },
    channels: {
      errors: nexus.channels?.errors || "",
      commands: nexus.channels?.commands || "",
      journal: nexus.channels?.journal || "",
    },
    database: {
      host: nexus.database?.host || "localhost",
      port: nexus.database?.port || 3306,
      username: nexus.database?.username || "root",
      password: nexus.database?.password || "",
      dbName: nexus.database?.dbName || "nexus",
      enabled: nexus.database?.enabled !== false,
    },
  };
}

const client = new Discord.Client({
  allowedMentions: {
    parse: ["roles", "users", "everyone"],
    repliedUser: false,
  },
  partials: [
    Discord.Partials.Message,
    Discord.Partials.Channel,
    Discord.Partials.Reaction,
  ],
  intents: [
    Discord.IntentsBitField.Flags.AutoModerationConfiguration,
    Discord.IntentsBitField.Flags.AutoModerationExecution,
    Discord.IntentsBitField.Flags.DirectMessagePolls,
    Discord.IntentsBitField.Flags.DirectMessageReactions,
    Discord.IntentsBitField.Flags.DirectMessageTyping,
    Discord.IntentsBitField.Flags.DirectMessages,
    Discord.IntentsBitField.Flags.GuildExpressions,
    Discord.IntentsBitField.Flags.GuildIntegrations,
    Discord.IntentsBitField.Flags.GuildInvites,
    Discord.IntentsBitField.Flags.GuildMembers,
    Discord.IntentsBitField.Flags.GuildMessagePolls,
    Discord.IntentsBitField.Flags.GuildMessageReactions,
    Discord.IntentsBitField.Flags.GuildMessageTyping,
    Discord.IntentsBitField.Flags.GuildMessages,
    Discord.IntentsBitField.Flags.GuildModeration,
    Discord.IntentsBitField.Flags.GuildPresences,
    Discord.IntentsBitField.Flags.GuildScheduledEvents,
    Discord.IntentsBitField.Flags.GuildVoiceStates,
    Discord.IntentsBitField.Flags.GuildWebhooks,
    Discord.IntentsBitField.Flags.Guilds,
    Discord.IntentsBitField.Flags.MessageContent,
  ],
});

client.cooldowns = new Discord.Collection();
client.slash = new Discord.Collection();
client.commands = new Discord.Collection();
client.loadedCommands = new Discord.Collection();
client.root = BOT_ROOT;

client.settings = loadSettings();
client.packages = require(path.join(__dirname, "..", "package.json"));
client.modules = require("./Utils/Modules.js");
client.logger = require("./Utils/Logger.js");
client.errors = require("./Utils/Errors.js");
client.responses = require("./Utils/Responses.js");
client.handlers = require("./Utils/Handlers.js");
client.pagination = require("./Utils/Pagination.js");
client.database = require("./Utils/Database/Database.js");

client.handlers.eventsLoader(client);
client.handlers.commandsLoader(client);

const date = new Date();
client.footer = `\u00a9 ${date.getFullYear()} • ${client.settings.bot.name}`;

if (!client.settings.bot.token) {
  client.logger.error("TOKEN_ERROR", "Missing bot token in settings/config.json");
  process.exit(1);
}

client.login(client.settings.bot.token).catch((err) => {
  client.logger.error("TOKEN_ERROR", err);
});
