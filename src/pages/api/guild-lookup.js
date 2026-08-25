import { getBotToken } from "../../lib/botToken";
import { lookupGuildDetails, parseGuildId } from "../../lib/guilds";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const guildId = parseGuildId(req.body?.id ?? req.body?.guildId ?? "");
  if (!guildId) {
    return res.status(400).json({ error: "Enter a valid guild snowflake ID." });
  }

  try {
    const result = await lookupGuildDetails(guildId, getBotToken());
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    return res.status(200).json(result.data);
  } catch (error) {
    console.error("Guild lookup failed:", error);
    return res.status(500).json({ error: "Failed to look up guild." });
  }
}
