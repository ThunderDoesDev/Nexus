import { parseUsername, formatUsernameCheck } from "../../lib/usernames";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username: input } = req.body || {};
  const parsed = parseUsername(input);

  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  try {
    const response = await fetch(
      "https://discord.com/api/v9/unique-username/username-attempt-unauthed",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: parsed.username }),
      }
    );

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      return res.status(429).json({
        error: retryAfter
          ? `Rate limited by Discord — try again in ${retryAfter}s.`
          : "Rate limited by Discord — try again shortly.",
      });
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const fieldError =
        data?.errors?.username?._errors?.[0]?.message ||
        data?.message ||
        `Discord returned ${response.status}`;
      return res.status(response.status === 400 ? 400 : response.status).json({
        error: fieldError,
      });
    }

    return res.status(200).json(formatUsernameCheck(parsed.username, data.taken));
  } catch (error) {
    console.error("Username check failed:", error);
    return res.status(500).json({ error: "Failed to check username availability." });
  }
}
