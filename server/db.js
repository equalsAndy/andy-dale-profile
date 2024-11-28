// db.js
const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,   // Ensures queued requests wait for a free connection
  connectionLimit: 10,        // Max number of connections in the pool
  queueLimit: 0               // No limit for queued requests
});

// Export the pool with promise support for async/await
module.exports = pool.promise();