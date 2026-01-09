// Vercel serverless function wrapper for Express app
// This file is used by Vercel to handle all API routes

let app;

try {
  // Load the Express app
  app = require('../app');
  console.log('Express app loaded successfully');
} catch (error) {
  console.error('Error loading Express app:', error);
  // Create a minimal error handler
  app = require('express')();
  app.use((req, res) => {
    res.status(500).json({
      error: 'Failed to initialize application',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });
}

// Export handler function for Vercel
// Vercel expects a function that receives (req, res) and handles the request
module.exports = app;

