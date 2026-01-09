// middleware/auth.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    // Try to get token from Authorization header first
    let token = null;
    
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    
    // Fallback to query parameter for backward compatibility (but log warning)
    if (!token && req.query.token) {
        console.warn('⚠️  Token passed via query parameter. Please use Authorization header.');
        token = req.query.token;
    }

    if (token == null) {
        return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification error:', err.message);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user; // Attach user info to request
        req.token = token; // Attach token for convenience
        next(); // Proceed to the next middleware or route handler
    });
}

// Optional middleware - allows requests but attaches user if token exists
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) {
                req.user = user;
                req.token = token;
            }
        });
    }
    next();
}

module.exports = { authenticateToken, optionalAuth };
