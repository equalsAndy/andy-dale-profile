const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = process.env.PORT || 5001;
const { addAndy,getLocations, getTitles, getAndys } = require('./controllers/andyController');  // Import the controller

// Use CORS middleware
app.use(cors({
    origin: 'http://localhost:3003',  // Allow requests from this origin
    methods: ['GET', 'POST'],         // Specify allowed HTTP methods
    credentials: true                 // Include credentials if needed
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