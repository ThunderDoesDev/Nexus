const chalk = require("chalk");

const Modules = {
  discord: require("discord.js"),
  cfonts: require("cfonts"),
  chalk: chalk.default || chalk,
  fs: require("fs"),
  fsPromises: require("fs").promises,
  util: require("util"),
  inspect: require("util").inspect,
  path: require("path"),
  moment: require("moment"),
  mysql: require("mysql2"),
  mysqlPromise: require("mysql2/promise"),
  os: require("os"),
};

module.exports = Modules;
