export default async function handler(req, res) {
  const { guild_id } = req.query;
  if (!guild_id) {
    return res.status(400).send("Missing guild_id from Discord invite");
  }
  res.redirect("/dashboard");
}
