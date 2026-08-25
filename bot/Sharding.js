const path = require("path");
const { ShardingManager } = require("discord.js");

const BOT_ROOT = __dirname;
process.chdir(BOT_ROOT);

function loadToken() {
  const nexus = require(path.join(__dirname, "..", "settings", "config.json"));
  return String(nexus.token || nexus.bot?.token || "").trim();
}

const token = loadToken();
if (!token) {
  console.error("[SHARDING MANAGER] Missing bot token in settings/config.json");
  process.exit(1);
}

const manager = new ShardingManager(path.join(BOT_ROOT, "Bot.js"), {
  token,
  totalShards: "auto",
  mode: "process",
  respawn: true,
  timeout: -1,
  shardList: "auto",
  execArgv: ["--trace-warnings"],
  spawnTimeout: 300000,
});

manager.modules = require("./Utils/Modules.js");
manager.logger = require("./Utils/Logger.js");
manager.errors = require("./Utils/Errors.js");
manager.settings = {
  bot: require(path.join(__dirname, "..", "settings", "config.json")).bot || {
    name: "Nexus",
  },
};

const Handlers = require("./Utils/Handlers.js");
Handlers.shardingEventsLoader(manager);

(async () => {
  try {
    await manager.spawn();
    manager.logger.log("SHARDING MANAGER", "All shards spawned successfully");
  } catch (err) {
    manager.logger.error(
      "SHARDING MANAGER",
      `Failed to spawn shards: ${err.message}`
    );
    process.exit(1);
  }
})();
