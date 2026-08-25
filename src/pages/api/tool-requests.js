import { getSessionFromReq } from "@/lib/auth";
import { isDatabaseEnabled, query } from "@/lib/db";
import { isDeveloper } from "@/lib/developers";

const TITLE_MAX = 120;
const DESC_MAX = 2000;
const RATE_LIMIT_MAX = 5;
const OWNER_STATUSES = new Set(["pending", "planned", "done", "declined"]);

function requireUser(req, res) {
  const session = getSessionFromReq(req);
  if (!session?.id) {
    res.status(401).json({ error: "Log in with Discord to continue." });
    return null;
  }
  return session;
}

function mapRow(row, { includeSubmitter = false } = {}) {
  const base = {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
  };
  if (includeSubmitter) {
    base.userId = row.user_id;
    base.username = row.username;
  }
  return base;
}

export default async function handler(req, res) {
  if (!isDatabaseEnabled()) {
    return res.status(503).json({ error: "Tool requests are temporarily unavailable." });
  }

  const session = requireUser(req, res);
  if (!session) return;

  const owner = isDeveloper(session.id);

  try {
    if (req.method === "GET") {
      if (owner) {
        const rows = await query(
          `SELECT id, user_id, username, title, description, status, created_at
           FROM tool_requests
           ORDER BY created_at DESC
           LIMIT 200`
        );
        return res.status(200).json({
          requests: rows.map((row) => mapRow(row, { includeSubmitter: true })),
          isOwner: true,
        });
      }

      const rows = await query(
        `SELECT id, title, description, status, created_at
         FROM tool_requests
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 50`,
        [String(session.id)]
      );
      return res.status(200).json({ requests: rows.map(mapRow), isOwner: false });
    }

    if (req.method === "POST") {
      const title = String(req.body?.title || "").trim();
      const description = String(req.body?.description || "").trim();

      if (!title || title.length < 3) {
        return res.status(400).json({ error: "Give your tool idea a short title (at least 3 characters)." });
      }
      if (title.length > TITLE_MAX) {
        return res.status(400).json({ error: `Title must be ${TITLE_MAX} characters or fewer.` });
      }
      if (!description || description.length < 10) {
        return res.status(400).json({ error: "Describe the tool in a bit more detail (at least 10 characters)." });
      }
      if (description.length > DESC_MAX) {
        return res.status(400).json({ error: `Description must be ${DESC_MAX} characters or fewer.` });
      }

      const recent = await query(
        `SELECT COUNT(*) AS count
         FROM tool_requests
         WHERE user_id = ? AND created_at >= (NOW() - INTERVAL 1 HOUR)`,
        [String(session.id)]
      );
      if (Number(recent?.[0]?.count || 0) >= RATE_LIMIT_MAX) {
        return res.status(429).json({
          error: `You can submit up to ${RATE_LIMIT_MAX} requests per hour. Try again later.`,
        });
      }

      const username = String(session.username || session.name || "Unknown").slice(0, 255);
      const result = await query(
        `INSERT INTO tool_requests (user_id, username, title, description)
         VALUES (?, ?, ?, ?)`,
        [String(session.id), username, title, description]
      );

      const inserted = await query(
        `SELECT id, user_id, username, title, description, status, created_at
         FROM tool_requests WHERE id = ? LIMIT 1`,
        [result.insertId]
      );

      return res.status(201).json({
        request: mapRow(inserted[0], { includeSubmitter: owner }),
        isOwner: owner,
      });
    }

    if (req.method === "PATCH") {
      if (!owner) {
        return res.status(403).json({ error: "Only the owner can update tool requests." });
      }

      const id = Number(req.body?.id);
      const status = String(req.body?.status || "").trim().toLowerCase();

      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "Invalid request id." });
      }
      if (!OWNER_STATUSES.has(status)) {
        return res.status(400).json({ error: "Status must be pending, planned, done, or declined." });
      }

      const result = await query(
        `UPDATE tool_requests SET status = ? WHERE id = ?`,
        [status, id]
      );
      if (!result?.affectedRows) {
        return res.status(404).json({ error: "Request not found." });
      }

      const rows = await query(
        `SELECT id, user_id, username, title, description, status, created_at
         FROM tool_requests WHERE id = ? LIMIT 1`,
        [id]
      );
      return res.status(200).json({
        request: mapRow(rows[0], { includeSubmitter: true }),
        isOwner: true,
      });
    }

    res.setHeader("Allow", "GET, POST, PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("tool-requests API:", error);
    return res.status(500).json({
      error: error?.code === "ECONNREFUSED"
        ? "Database is unavailable right now."
        : "Something went wrong. Please try again.",
    });
  }
}
