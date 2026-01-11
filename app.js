const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const businessRoutes = require('./routes/businessRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const taskRoutes = require('./routes/taskRoutes');
const homeRoutes = require('./routes/homeRoutes');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes (with credentials for cookies)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));

// Set headers to fix Cross-Origin-Opener-Policy issues
app.use((req, res, next) => {
  // Allow cross-origin requests for Firebase Auth redirects
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes - Register before static file serving
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/home', homeRoutes);

// Debug: Log all API route registrations
console.log('✅ API Routes registered:');
console.log('  - /api/users');
console.log('  - /api/tasks');
console.log('  - /api/businesses');
console.log('  - /api/employees');
console.log('  - /api/home');

// Legacy routes for backward compatibility (redirect to React app)
app.get('/redirect-to-task', (req, res) => {
    const { taskId } = req.query;
    res.redirect(`/employee/task/${taskId}`);
});

// Serve static files from React build (in production)
// In development, React app is served by webpack-dev-server on port 3001
// Only serve static files if NOT running on Vercel (Vercel handles static files separately)
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res, next) => {
        // Don't serve HTML for API routes
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
} else if (process.env.NODE_ENV !== 'production') {
    // In development, redirect non-API routes to React dev server
    app.get('*', (req, res, next) => {
        // Don't redirect API routes
        if (req.path.startsWith('/api')) {
            return next();
        }
        // Redirect to React dev server
        res.redirect(`http://localhost:3001${req.path}`);
    });
}

app.use((req, res, next) => {
    // Only send 404 for API routes that don't exist
    if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'API route not found' });
    } else {
        res.status(404).send('Route not found. Please access the app at http://localhost:3001');
    }
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});

// Only start the server if not running as a serverless function (Vercel)
if (process.env.VERCEL !== '1') {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`\n❌ Port ${port} is already in use!\n`);
            console.log('Try one of these solutions:');
            console.log(`1. Kill the process using port ${port}:`);
            console.log(`   lsof -ti:${port} | xargs kill -9`);
            console.log(`2. Or change the port in your .env file or environment variable`);
            console.log(`   PORT=3001 npm start\n`);
            process.exit(1);
        } else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });
}

// Export the app for Vercel serverless functions
module.exports = app;
