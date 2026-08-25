let pool;
let client;

const getConfig = (clientInstance) => {
  const { database } = clientInstance.settings;
  return {
    user: database.username,
    password: database.password,
    host: database.host,
    database: database.dbName,
    port: database.port,
  };
};

const initializeDatabase = async (dbPool) => {
  try {
    await dbPool.query(`CREATE TABLE IF NOT EXISTS clients (
            client_id VARCHAR(255) PRIMARY KEY,
            client_name VARCHAR(255) NOT NULL,
            commands_used INT NOT NULL DEFAULT 0,
            maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
            debug_mode BOOLEAN NOT NULL DEFAULT FALSE
        )`);
    await dbPool.query(`CREATE TABLE IF NOT EXISTS username_history (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(32) NOT NULL,
            username VARCHAR(255) NULL,
            global_name VARCHAR(255) NULL,
            discriminator VARCHAR(10) NULL,
            observed_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            source VARCHAR(32) NOT NULL DEFAULT 'lookup',
            INDEX idx_username_history_user (user_id),
            INDEX idx_username_history_observed (observed_at)
        )`);
    client.logger.log("MYSQL", "All tables initialized successfully");
  } catch (error) {
    client.errors(client, error, null, "Database");
  }
};

const db = {
  get pool() {
    return pool;
  },
  get ready() {
    return Boolean(pool);
  },
  async start(clientInstance) {
    try {
      client = clientInstance;
      if (client.settings.database?.enabled === false) {
        client.logger.warn("MYSQL", "Database disabled in settings.");
        return "Database Disabled.";
      }
      const config = getConfig(client);
      pool = client.modules.mysqlPromise.createPool(config);
      await pool.getConnection();
      await initializeDatabase(pool);
      client.logger.log("MYSQL", "Database is connected and ready.");
      return "Database Connected.";
    } catch (error) {
      pool = null;
      client.logger.warn(
        "MYSQL",
        `Database unavailable (${error.code || error.message}). Continuing without it.`
      );
      return "Database Unavailable.";
    }
  },
  async close(clientInstance) {
    try {
      if (pool) {
        await pool.end();
        pool = null;
      }
      clientInstance.logger.log("MYSQL", "Database connection closed.");
      return "Database Disconnected.";
    } catch (error) {
      clientInstance.errors(clientInstance, error, null, "Database");
    }
  },
  async query(text, params = []) {
    try {
      if (!pool) {
        throw new Error("Database pool is not ready");
      }
      return await pool.query(text, params);
    } catch (error) {
      if (client) client.errors(client, error, null, "Database");
      throw error;
    }
  },
};

db.models = {
  Client: require("./Models/Client.js")(db),
  UsernameHistory: require("./Models/UsernameHistory.js")(db),
};

module.exports = db;
