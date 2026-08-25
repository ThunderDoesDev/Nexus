import { fetchBotGuilds } from "@/lib/guildCache";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { guilds, cached } = await fetchBotGuilds();
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({
      guilds: Array.isArray(guilds) ? guilds.length : 0,
      cached: Boolean(cached),
    });
  } catch {
    return res.status(200).json({ guilds: null, cached: false });
  }
}
