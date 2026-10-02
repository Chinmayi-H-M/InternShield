const express = require('express');
const cors = require('cors');
require('dotenv').config();

const analyzeRoute = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' })); // Limit request body size

// Routes
app.use('/api', analyzeRoute);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('InternShield Backend is running.');
});

// Start the server (skip in test environment so tests can use supertest)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
