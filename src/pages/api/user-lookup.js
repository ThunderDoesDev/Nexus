import { getBotToken } from "../../lib/botToken";
import { formatUser, parseUserId } from "../../lib/users";
import { fetchPresenceProfile } from "../../lib/presence";
import { observeUsername } from "../../lib/usernameHistory";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = parseUserId(req.body?.id ?? req.body?.userId ?? "");
  if (!userId) {
    return res.status(400).json({ error: "Enter a valid user snowflake ID." });
  }

  const token = getBotToken();
  if (!token) {
    return res.status(503).json({
      error: "User lookup requires a bot token in settings/config.json.",
    });
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bot ${token}`,
      },
    });

    if (response.status === 404) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return res.status(response.status).json({
        error: text || `Discord returned ${response.status}`,
      });
    }

    const raw = await response.json();
    const user = formatUser(raw);

    observeUsername(
      userId,
      {
        username: raw.username,
        globalName: raw.global_name,
        discriminator: raw.discriminator,
      },
      "lookup"
    ).catch(() => {});

    let presence = null;
    try {
      presence = await fetchPresenceProfile(userId);
      if (presence?.source == null && presence?.status === "offline") {
        presence = null;
      }
    } catch {
      presence = null;
    }

    return res.status(200).json({ ...user, presence });
  } catch (error) {
    console.error("User lookup failed:", error);
    return res.status(500).json({ error: "Failed to look up user." });
  }
}
