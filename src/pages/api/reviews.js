import { getSessionFromReq } from "@/lib/auth";
import { isDatabaseEnabled, query } from "@/lib/db";
import { isDeveloper } from "@/lib/developers";

const QUOTE_MAX = 400;
const ROLE_MAX = 80;
const RATE_LIMIT_MAX = 3;
const OWNER_STATUSES = new Set(["pending", "approved", "declined"]);

function avatarUrl(userId, avatarHash) {
  if (!userId) return null;
  if (avatarHash) {
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}?size=128`;
  }
  return "https://cdn.discordapp.com/embed/avatars/0.png";
}

function mapRow(row, { includeSubmitter = false, includeStatus = false } = {}) {
  const base = {
    id: row.id,
    quote: row.quote,
    rating: Number(row.rating),
    role: row.role || "",
    name: row.username,
    image: avatarUrl(row.user_id, row.avatar),
    createdAt: row.created_at,
  };
  if (includeStatus) base.status = row.status;
  if (includeSubmitter) {
    base.userId = row.user_id;
    base.username = row.username;
  }
  return base;
}

export default async function handler(req, res) {
  if (!isDatabaseEnabled()) {
    return res.status(503).json({ error: "Reviews are temporarily unavailable." });
  }

  try {
    if (req.method === "GET") {
      const mine = String(req.query?.mine || "") === "1";
      const session = getSessionFromReq(req);

      if (mine) {
        if (!session?.id) {
          return res.status(401).json({ error: "Log in with Discord to continue." });
        }
        const owner = isDeveloper(session.id);
        if (owner) {
          const rows = await query(
            `SELECT id, user_id, username, avatar, role, quote, rating, status, created_at
             FROM reviews
             ORDER BY created_at DESC
             LIMIT 200`
          );
          return res.status(200).json({
            reviews: rows.map((row) =>
              mapRow(row, { includeSubmitter: true, includeStatus: true })
            ),
            isOwner: true,
          });
        }

        const rows = await query(
          `SELECT id, user_id, username, avatar, role, quote, rating, status, created_at
           FROM reviews
           WHERE user_id = ?
           ORDER BY created_at DESC
           LIMIT 50`,
          [String(session.id)]
        );
        return res.status(200).json({
          reviews: rows.map((row) => mapRow(row, { includeStatus: true })),
          isOwner: false,
        });
      }

      const rows = await query(
        `SELECT id, user_id, username, avatar, role, quote, rating, status, created_at
         FROM reviews
         WHERE status = 'approved'
         ORDER BY created_at DESC
         LIMIT 12`
      );
      return res.status(200).json({
        reviews: rows.map((row) => mapRow(row)),
      });
    }

    if (req.method === "POST") {
      const session = getSessionFromReq(req);
      if (!session?.id) {
        return res.status(401).json({ error: "Log in with Discord to continue." });
      }

      const quote = String(req.body?.quote || "").trim();
      const role = String(req.body?.role || "").trim();
      const rating = Number(req.body?.rating);

      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Pick a rating from 1 to 5 stars." });
      }
      if (!quote || quote.length < 10) {
        return res.status(400).json({ error: "Write a bit more about your experience (at least 10 characters)." });
      }
      if (quote.length > QUOTE_MAX) {
        return res.status(400).json({ error: `Review must be ${QUOTE_MAX} characters or fewer.` });
      }
      if (role.length > ROLE_MAX) {
        return res.status(400).json({ error: `Role must be ${ROLE_MAX} characters or fewer.` });
      }

      const recent = await query(
        `SELECT COUNT(*) AS count
         FROM reviews
         WHERE user_id = ? AND created_at >= (NOW() - INTERVAL 1 HOUR)`,
        [String(session.id)]
      );
      if (Number(recent?.[0]?.count || 0) >= RATE_LIMIT_MAX) {
        return res.status(429).json({
          error: `You can submit up to ${RATE_LIMIT_MAX} reviews per hour. Try again later.`,
        });
      }

      const username = String(session.username || session.name || "Unknown").slice(0, 255);
      const avatar = session.avatar ? String(session.avatar).slice(0, 128) : null;
      const result = await query(
        `INSERT INTO reviews (user_id, username, avatar, role, quote, rating)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [String(session.id), username, avatar, role, quote, rating]
      );

      const inserted = await query(
        `SELECT id, user_id, username, avatar, role, quote, rating, status, created_at
         FROM reviews WHERE id = ? LIMIT 1`,
        [result.insertId]
      );

      return res.status(201).json({
        review: mapRow(inserted[0], { includeStatus: true }),
      });
    }

    if (req.method === "PATCH") {
      const session = getSessionFromReq(req);
      if (!session?.id) {
        return res.status(401).json({ error: "Log in with Discord to continue." });
      }
      if (!isDeveloper(session.id)) {
        return res.status(403).json({ error: "Only the owner can moderate reviews." });
      }

      const id = Number(req.body?.id);
      const status = String(req.body?.status || "").trim().toLowerCase();

      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "Invalid review id." });
      }
      if (!OWNER_STATUSES.has(status)) {
        return res.status(400).json({ error: "Status must be pending, approved, or declined." });
      }

      const result = await query(`UPDATE reviews SET status = ? WHERE id = ?`, [status, id]);
      if (!result?.affectedRows) {
        return res.status(404).json({ error: "Review not found." });
      }

      const rows = await query(
        `SELECT id, user_id, username, avatar, role, quote, rating, status, created_at
         FROM reviews WHERE id = ? LIMIT 1`,
        [id]
      );
      return res.status(200).json({
        review: mapRow(rows[0], { includeSubmitter: true, includeStatus: true }),
        isOwner: true,
      });
    }

    res.setHeader("Allow", "GET, POST, PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("reviews API:", error);
    return res.status(500).json({
      error:
        error?.code === "ECONNREFUSED"
          ? "Database is unavailable right now."
          : "Something went wrong. Please try again.",
    });
  }
}
