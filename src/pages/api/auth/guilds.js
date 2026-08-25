import { getSessionFromReq } from "@/lib/auth";
import { fetchManageableGuilds } from "@/lib/guildCache";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = getSessionFromReq(req);
  if (!session?.accessToken || !session?.id) {
    return res.status(401).json({ error: "Not authenticated", guilds: [] });
  }

  const force = req.query.refresh === "1";

  try {
    const result = await fetchManageableGuilds(session.id, session.accessToken, { force });
    res.setHeader("Cache-Control", "private, max-age=60");
    return res.status(200).json({
      guilds: result.guilds,
      cached: Boolean(result.cached),
      stale: Boolean(result.stale),
    });
  } catch (error) {
    console.error("Guilds fetch error:", error);
    if (error.status === 429) {
      res.setHeader("Retry-After", String(Math.ceil(error.retryAfter || 5)));
      return res.status(429).json({
        error: "Discord rate limit — try again in a moment",
        retryAfter: error.retryAfter || 5,
        guilds: [],
      });
    }
    return res.status(error.status || 500).json({
      error: error.message || "Failed to fetch guilds",
      guilds: [],
    });
  }
}
