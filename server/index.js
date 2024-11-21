const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = process.env.PORT || 5001;
const { addAndy,getLocations, getTitles, getAndys } = require('./controllers/andyController');  // Import the controller
const allowedOrigins = ['http://localhost:3003', 'https://andy.ootao.io', 'https://www.andydale.me', 'https://andydale.me', 'http://www.andydale.me', 'http://andydale.me','http://54.205.87.18'];

// Use CORS middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with `null` origin (e.g., local files, some tools)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow the origin
        } else {
            //callback(new Error('Not allowed by CORS'));
            callback(null, true); // Allow the origin
        }
    },
    methods: ['GET', 'POST'],         // Specify allowed HTTP methods
    credentials: true                 // Allow credentials like cookies
}));

// Middleware to parse JSON requests
app.use(express.json());

// Route to add an Andy profile
app.post('/api/add-andy', addAndy);  // Use the controller function as the handler
app.get('/api/locations', getLocations); 
app.get('/api/titles', getTitles); 
app.get('/api/andys', getAndys);


// Test database route (optional)
app.get('/test-db', (req, res) => {
  const db = require('./db');
  db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) throw err;
    res.send(`Database Test: 1 + 1 = ${results[0].solution}`);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));