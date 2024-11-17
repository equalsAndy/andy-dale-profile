// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'andyAdmin',
  // password: 'lion99!',
  password: 'Qx7!kN8*Vp3#zL!',
 
  database: 'AndyDale'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = db;