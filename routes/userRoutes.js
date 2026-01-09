const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getUserInfoFromEmail, getBusinessIDByUserID, getEmployeeIDByUserID } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET;

// Public route - get JWT token from email (Firebase Auth)
router.get('/getUserId', async (req, res) => {
    try {
        const email = req.query.email; // Extract email from query parameters
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const userInfo = await getUserInfoFromEmail(email); // Call function to get user information
        if (userInfo) {
            const { uid, email: userEmail, displayName, photoURL } = userInfo;
            const token = jwt.sign({ uid, email: userEmail, displayName, photoURL }, JWT_SECRET, { expiresIn: '24h' }); // Generate JWT token (24h expiry)
            res.status(200).json({ token, user: { uid, email: userEmail, displayName, photoURL } }); // Send response with JWT token
        } else {
            res.status(404).json({ error: 'User not found' }); // Handle case where user information is not found
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' }); // Handle any internal errors
    }
});

// Refresh token endpoint - extends session by generating new token
router.post('/refresh-token', authenticateToken, async (req, res) => {
    try {
        // User is already authenticated via authenticateToken middleware
        const { uid, email, displayName, photoURL } = req.user;
        
        // Generate new token with fresh 24h expiration
        const newToken = jwt.sign(
            { uid, email, displayName, photoURL },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(200).json({
            token: newToken,
            user: { uid, email, displayName, photoURL },
            expiresIn: '24h'
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ error: 'Failed to refresh token' });
    }
});

// Deprecated - kept for backward compatibility but should use Authorization header instead
router.get('/getUpdatedToken', async (req, res) => {
    try {
        const taskID = req.query.taskID;
        let token = req.query.token;
        
        // Try to get token from Authorization header first
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token || !taskID) {
            return res.status(400).json({ error: 'token or taskID cannot be found' });
        }

        // Verify the original token first
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired token' });
            }

            // Create new token with task context (deprecated approach)
            const newPayload = { ...decoded, taskID };
            const updatedToken = jwt.sign(newPayload, JWT_SECRET, { expiresIn: '24h' });
            res.status(200).json({ updatedToken });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Protected routes - get business/employee ID for authenticated user
router.get('/:uid', authenticateToken, getBusinessIDByUserID);
router.get('/emp/:uid', authenticateToken, getEmployeeIDByUserID);

module.exports = router;
