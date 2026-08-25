module.exports = (db) => ({
  async ensureTable() {
    await db.query(`
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
  },

  async observe(userId, snapshot, source = "userUpdate") {
    if (!userId || !db.ready) return null;

    const username =
      snapshot?.username != null && snapshot.username !== ""
        ? String(snapshot.username)
        : null;
    const globalName =
      snapshot?.globalName != null && snapshot.globalName !== ""
        ? String(snapshot.globalName)
        : snapshot?.global_name != null && snapshot.global_name !== ""
          ? String(snapshot.global_name)
          : null;
    let discriminator =
      snapshot?.discriminator != null && snapshot.discriminator !== ""
        ? String(snapshot.discriminator)
        : null;
    if (discriminator === "0" || discriminator === "0000") discriminator = null;

    if (!username && !globalName) return null;

    await this.ensureTable();

    const [latest] = await db.query(
      `SELECT username, global_name, discriminator
       FROM username_history
       WHERE user_id = ?
       ORDER BY observed_at DESC, id DESC
       LIMIT 1`,
      [String(userId)]
    );

    const prev = latest?.[0];
    if (
      prev &&
      (prev.username || null) === username &&
      (prev.global_name || null) === globalName &&
      (prev.discriminator || null) === discriminator
    ) {
      return null;
    }

    const [result] = await db.query(
      `INSERT INTO username_history (user_id, username, global_name, discriminator, source)
       VALUES (?, ?, ?, ?, ?)`,
      [String(userId), username, globalName, discriminator, String(source).slice(0, 32)]
    );

    return result?.insertId ?? null;
  },
});
