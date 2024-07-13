// middleware/auth.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from Bearer scheme

    if (token == null) return res.sendStatus(401); // If no token is present, return 401

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // If token is invalid or expired, return 403
        req.user = user; // Attach user info to request
        next(); // Proceed to the next middleware or route handler
    });
}

module.exports = authenticateToken;
