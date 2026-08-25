const path = require("path");
const cfonts = require("cfonts");

module.exports.run = async (manager, shard) => {
  try {
    const nexus = require(path.join(
      __dirname,
      "..",
      "..",
      "..",
      "settings",
      "config.json"
    ));
    const botName = nexus.bot?.name || "Nexus";

    const banner = cfonts.render(botName, {
      font: "chrome",
      color: "candy",
      align: "center",
      gradient: ["red", "magenta"],
      lineHeight: 1,
    });
    console.log(banner.string);

    if (shard && typeof shard.id !== "undefined") {
      manager.logger.log(
        manager.modules.chalk.green("SHARDING MANAGER"),
        `ShardID: ${shard.id} - Created.`
      );
    }
  } catch (error) {
    return manager.errors(manager, error.stack, null, "Event");
  }
};
