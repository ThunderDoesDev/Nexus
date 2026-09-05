import { spawn } from "node:child_process";
import process from "node:process";

const webArgs = process.argv.slice(2);
if (!webArgs.length) {
  console.error("Usage: node scripts/run-with-bot.mjs <next-args...>");
  process.exit(1);
}

const isWin = process.platform === "win32";
const children = [];

function run(command, args) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: isWin,
    env: process.env,
  });
  children.push(child);
  return child;
}

function shutdown() {
  for (const child of children) {
    if (child.killed || !child.pid) continue;
    if (isWin) {
      spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
        stdio: "ignore",
        windowsHide: true,
      });
    } else {
      child.kill("SIGTERM");
    }
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

run("npx", ["next", ...webArgs]);
run(process.execPath, ["bot/Sharding.js"]);
