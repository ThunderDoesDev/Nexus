import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let base = "http://127.0.0.1:4001";
  try {
    const config = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "settings", "config.json"), "utf8")
    );
    if (config.presence?.url) base = String(config.presence.url).replace(/\/$/, "");
  } catch {
    // ignore
  }
  if (process.env.PRESENCE_URL) base = String(process.env.PRESENCE_URL).replace(/\/$/, "");

  let health = null;
  try {
    const response = await fetch(`${base}/health`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(1500),
    });
    if (response.ok) health = await response.json();
  } catch {
    health = null;
  }

  const botId = health?.bot?.id || null;

  return res.status(200).json({
    running: Boolean(health?.ok || health?.ready),
    url: base,
    users: health?.users ?? 0,
    guilds: health?.guilds ?? 0,
    bot: health?.bot || null,
    inviteUrl: botId
      ? `https://discord.com/oauth2/authorize?client_id=${botId}&scope=bot&permissions=0`
      : null,
    setup: {
      start: "npm run presence",
      intents: ["Presence Intent", "Server Members Intent"],
      note: "Invite the bot into servers that contain the users you want to track.",
    },
  });
}
