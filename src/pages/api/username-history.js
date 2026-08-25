import { getBotToken } from "../../lib/botToken";
import { parseUserId, formatUser } from "../../lib/users";
import {
  getUsernameHistory,
  observeUsername,
  ensureUsernameHistoryTable,
} from "../../lib/usernameHistory";
import { isDatabaseEnabled } from "../../lib/db";

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
      error: "Username history requires a bot token in settings/config.json.",
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

    let history = [];
    let trackingEnabled = isDatabaseEnabled();

    if (trackingEnabled) {
      try {
        await ensureUsernameHistoryTable();
        await observeUsername(
          userId,
          {
            username: raw.username,
            globalName: raw.global_name,
            discriminator: raw.discriminator,
          },
          "lookup"
        );
        history = await getUsernameHistory(userId);
      } catch (error) {
        console.error("Username history DB error:", error);
        trackingEnabled = false;
      }
    }

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        globalName: user.globalName,
        displayName: user.displayName,
        avatar: user.avatar,
        profileUrl: user.profileUrl,
        bot: user.bot,
      },
      history,
      count: history.length,
      trackingEnabled,
      note: trackingEnabled
        ? history.length <= 1
          ? "Only the current name is stored so far. More entries appear as Nexus observes changes (lookups + bot userUpdate)."
          : null
        : "Database is disabled — history is not being stored.",
    });
  } catch (error) {
    console.error("Username history lookup failed:", error);
    return res.status(500).json({ error: "Failed to look up username history." });
  }
}
