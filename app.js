const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const businessRoutes = require('./routes/businessRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const taskRoutes = require('./routes/taskRoutes');
const homeRoutes = require('./routes/homeRoutes');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/home', homeRoutes);

// Legacy routes for backward compatibility (redirect to React app)
app.get('/redirect-to-task', (req, res) => {
    const { taskId } = req.query;
    res.redirect(`/employee/task/${taskId}`);
});

// Serve static files from React build (in production)
// In development, React app is served by webpack-dev-server on port 3001
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
} else {
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
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

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
