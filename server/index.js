require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');
const {
  addAndy, getLocations, getTitles, getAndys
} = require('./controllers/andyController');
const {
  addEmail, updateEmail, deleteEmail, getEmails, sendAdminMessage
} = require('./controllers/emailController');

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

const allowedOrigins = [
  'http://localhost:3003',
  'https://andy.ootao.io',
  'https://www.andydale.me',
  'https://andydale.me',
  'http://www.andydale.me',
  'http://andydale.me',
  'http://54.205.87.18',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`Origin ${origin} not allowed by CORS`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());


app.post('/api/sendAdminMessage', sendAdminMessage);
app.post('/api/add-andy', addAndy);
app.get('/api/locations', getLocations);
app.get('/api/titles', getTitles);
app.get('/api/andys', getAndys);
app.post('/api/add-email', addEmail);
app.post('/api/update-email', updateEmail);
app.post('/api/delete-email', deleteEmail);
app.post('/api/get-emails', getEmails);


app.get('/test-db', (req, res) => {
  db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) throw err;
    res.send(`Database Test: 1 + 1 = ${results[0].solution}`);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));