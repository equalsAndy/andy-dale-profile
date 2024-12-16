
const mysql = require('mysql2');
require('dotenv').config(); // Load environment variables



// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Export the `pool.promise()` directly for use in query operations
const db = pool.promise();

// Add a `close` method to explicitly close the pool
db.close = async () => {
  await pool.end();
};

module.exports = db;