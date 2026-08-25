import fs from "fs";
import path from "path";

/**
 * Resolve Discord bot token from env or settings/config.json.
 * Server-side only — never import from client components.
 */
export function getBotToken() {
  const fromEnv = String(process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN || "").trim();
  if (fromEnv) return fromEnv;

  try {
    const configPath = path.join(process.cwd(), "settings", "config.json");
    const raw = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(raw);
    return String(config.token || config.DISCORD_BOT_TOKEN || "").trim();
  } catch {
    return "";
  }
}
