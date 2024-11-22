require('dotenv').config();


const express = require('express'); // Import express
const cors = require('cors'); // Import CORS middleware


const { addAndy, getLocations, getTitles, getAndys } = require('./controllers/andyController'); // Import Andy controller
const { addEmail, updateEmail, deleteEmail, getEmails } = require('./controllers/emailController'); // Import Email controller

const app = express();
const PORT = process.env.SERVER_PORT;

const allowedOrigins = [
    'http://localhost:3003',
    'https://andy.ootao.io',
    'https://www.andydale.me',
    'https://andydale.me',
    'http://www.andydale.me',
    'http://andydale.me',
    'http://54.205.87.18',
];

// Use CORS middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with `null` origin (e.g., local files, some tools)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow the origin
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'], // Specify allowed HTTP methods
    credentials: true, // Allow credentials like cookies
}));

// Middleware to parse JSON requests
app.use(express.json());

// Route to add an Andy profile
app.post('/api/add-andy', addAndy);
app.get('/api/locations', getLocations);
app.get('/api/titles', getTitles);
app.get('/api/andys', getAndys);
app.post('/api/addEmail', addEmail);
app.post('/api/updateEmail', updateEmail);
app.post('/api/deleteEmail', deleteEmail);
app.post('/api/getEmails', getEmails);

// Test database route (optional)
app.get('/test-db', (req, res) => {
    const db = require('./db'); // Use the database connection
    db.query('SELECT 1 + 1 AS solution', (err, results) => {
        if (err) throw err;
        res.send(`Database Test: 1 + 1 = ${results[0].solution}`);
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));