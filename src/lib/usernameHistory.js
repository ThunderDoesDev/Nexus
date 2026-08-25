import { query, isDatabaseEnabled, getPool } from "./db";

let tableReady = false;

export async function ensureUsernameHistoryTable() {
  if (!isDatabaseEnabled()) return false;
  if (tableReady) return true;
  await getPool();
  await query(`
    CREATE TABLE IF NOT EXISTS username_history (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(32) NOT NULL,
      username VARCHAR(255) NULL,
      global_name VARCHAR(255) NULL,
      discriminator VARCHAR(10) NULL,
      observed_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      source VARCHAR(32) NOT NULL DEFAULT 'lookup',
      INDEX idx_username_history_user (user_id),
      INDEX idx_username_history_observed (observed_at)
    )
  `);
  tableReady = true;
  return true;
}

function normalizeName(value) {
  if (value == null || value === "") return null;
  return String(value);
}

function normalizeDiscriminator(value) {
  if (value == null || value === "" || value === "0" || value === "0000") return null;
  return String(value);
}

function sameSnapshot(a, b) {
  return (
    normalizeName(a?.username) === normalizeName(b?.username) &&
    normalizeName(a?.globalName ?? a?.global_name) ===
      normalizeName(b?.globalName ?? b?.global_name) &&
    normalizeDiscriminator(a?.discriminator) === normalizeDiscriminator(b?.discriminator)
  );
}

/**
 * Persist a username snapshot if it differs from the latest row for this user.
 * Returns the inserted row id, or null if unchanged / DB unavailable.
 */
export async function observeUsername(userId, snapshot, source = "lookup") {
  if (!userId || !isDatabaseEnabled()) return null;

  try {
    await ensureUsernameHistoryTable();

    const next = {
      username: normalizeName(snapshot?.username),
      globalName: normalizeName(snapshot?.globalName ?? snapshot?.global_name),
      discriminator: normalizeDiscriminator(snapshot?.discriminator),
    };

    if (!next.username && !next.globalName) return null;

    const latest = await query(
      `SELECT username, global_name, discriminator
       FROM username_history
       WHERE user_id = ?
       ORDER BY observed_at DESC, id DESC
       LIMIT 1`,
      [String(userId)]
    );

    if (latest?.[0] && sameSnapshot(latest[0], next)) {
      return null;
    }

    const result = await query(
      `INSERT INTO username_history (user_id, username, global_name, discriminator, source)
       VALUES (?, ?, ?, ?, ?)`,
      [
        String(userId),
        next.username,
        next.globalName,
        next.discriminator,
        String(source || "lookup").slice(0, 32),
      ]
    );

    return result?.insertId ?? null;
  } catch (error) {
    console.error("username history observe failed:", error);
    return null;
  }
}

export async function getUsernameHistory(userId, limit = 100) {
  if (!userId || !isDatabaseEnabled()) return [];

  try {
    await ensureUsernameHistoryTable();
    const rows = await query(
      `SELECT id, user_id, username, global_name, discriminator, observed_at, source
       FROM username_history
       WHERE user_id = ?
       ORDER BY observed_at DESC, id DESC
       LIMIT ?`,
      [String(userId), Math.min(Math.max(Number(limit) || 100, 1), 500)]
    );

    return (rows || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      username: row.username,
      globalName: row.global_name,
      discriminator: row.discriminator,
      observedAt:
        row.observed_at instanceof Date
          ? row.observed_at.toISOString()
          : row.observed_at
            ? new Date(row.observed_at).toISOString()
            : null,
      source: row.source,
      handle: row.username
        ? row.discriminator
          ? `${row.username}#${row.discriminator}`
          : `@${row.username}`
        : null,
      displayName: row.global_name || row.username || null,
    }));
  } catch (error) {
    console.error("username history fetch failed:", error);
    return [];
  }
}
