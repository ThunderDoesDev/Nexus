import mysql from "mysql2/promise";
import config from "@/settings/config.json";

let pool = null;
let ensured = false;

function dbConfig() {
  const db = config.database || {};
  return {
    host: db.host || "localhost",
    port: Number(db.port) || 3306,
    user: db.username || "root",
    password: db.password || "",
    database: db.dbName || "nexus",
    waitForConnections: true,
    connectionLimit: 5,
  };
}

export function isDatabaseEnabled() {
  return config.database?.enabled !== false;
}

export async function getPool() {
  if (!isDatabaseEnabled()) {
    throw new Error("Database is disabled");
  }
  if (!pool) {
    const cfg = dbConfig();
    // Ensure schema exists (local/dev may not have created it yet)
    const bootstrap = await mysql.createConnection({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
    });
    try {
      await bootstrap.query(
        `CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
    } finally {
      await bootstrap.end();
    }
    pool = mysql.createPool(cfg);
  }
  if (!ensured) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tool_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(32) NOT NULL,
        username VARCHAR(255) NOT NULL,
        title VARCHAR(120) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('pending', 'planned', 'done', 'declined') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_tool_requests_user (user_id),
        INDEX idx_tool_requests_created (created_at)
      )
    `);
    await pool.query(`
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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(32) NOT NULL,
        username VARCHAR(255) NOT NULL,
        avatar VARCHAR(128) NULL,
        role VARCHAR(80) NOT NULL DEFAULT '',
        quote TEXT NOT NULL,
        rating TINYINT NOT NULL,
        status ENUM('pending', 'approved', 'declined') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_reviews_user (user_id),
        INDEX idx_reviews_status (status),
        INDEX idx_reviews_created (created_at)
      )
    `);
    ensured = true;
  }
  return pool;
}

export async function query(sql, params = []) {
  const db = await getPool();
  const [rows] = await db.query(sql, params);
  return rows;
}
