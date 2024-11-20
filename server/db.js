// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'ls-8f8e643f3feaeca73303d429ffcfe9f14e17b32f.cpey1rm7ivfi.us-east-1.rds.amazonaws.com',
  user: 'andyUser',
  password: 'poipoi123!!',
  
/*
  host: 'localhost',
  user: 'andyAdmin',
  
  password: 'Qx7!kN8*Vp3#zL!',
  
  */
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