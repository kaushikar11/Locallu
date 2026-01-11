const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getUserInfoFromEmail, getBusinessIDByUserID, getEmployeeIDByUserID, createUser, signInUser, verifyIdToken } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { verifyIdToken: verifyFirebaseIdToken } = require('../utils/firebaseAuth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Health check endpoint to verify routes are working
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'User routes are working' });
});

// NEW: Verify Firebase ID token endpoint (used by all auth methods)
router.post('/verify-token', async (req, res) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    console.log(`[AUTH] [${timestamp}] VERIFY TOKEN ATTEMPT - IP: ${ip}`);
    
    try {
        const { idToken } = req.body;
        
        if (!idToken) {
            console.log(`[AUTH] [${timestamp}] VERIFY TOKEN FAILED - No ID token provided`);
            return res.status(400).json({ error: 'ID token is required' });
        }

        console.log(`[AUTH] [${timestamp}] VERIFY TOKEN - Starting token verification...`);
        
        // Verify the Firebase ID token using REST API
        let decodedToken;
        try {
            decodedToken = await verifyFirebaseIdToken(idToken);
            console.log(`[AUTH] [${timestamp}] VERIFY TOKEN - Token verified, UID: ${decodedToken.uid}`);
        } catch (error) {
            console.error(`[AUTH] [${timestamp}] VERIFY TOKEN - Token verification failed:`, error.code || error.message);
            if (error.code === 'auth/id-token-expired') {
                return res.status(401).json({ error: 'ID token expired. Please sign in again.' });
            }
            return res.status(401).json({ error: 'Invalid ID token: ' + (error.message || 'Unknown error') });
        }

        const { uid, email: userEmail, name, picture } = decodedToken;
        const userName = name || '';
        const userPhoto = picture || '';

        console.log(`[AUTH] [${timestamp}] VERIFY TOKEN - User verified: ${userEmail} (${uid})`);

        // Get or create user document in Firestore
        const { db } = require('../config/firebase');
        const { doc, setDoc, getDoc, updateDoc, serverTimestamp } = require('firebase/firestore');
        const userRef = doc(db, 'users', uid);
        
        let userDocExists = false;
        try {
            const userDoc = await getDoc(userRef);
            userDocExists = userDoc.exists();
            console.log(`[AUTH] [${timestamp}] VERIFY TOKEN - User document exists: ${userDocExists}`);
        } catch (error) {
            console.error(`[AUTH] [${timestamp}] VERIFY TOKEN - Error getting user document:`, error.message);
            // Continue even if Firestore read fails - we'll try to create
        }
        
        if (!userDocExists) {
            // Create user document
            console.log(`[AUTH] [${timestamp}] VERIFY TOKEN - Creating new user document`);
            try {
                await setDoc(userRef, {
                    email: userEmail,
                    displayName: userName,
                    photoURL: userPhoto,
                    createdAt: serverTimestamp(),
                    businessId: null,
                    employeeId: null,
                    lastLoginAt: serverTimestamp()
                }, { merge: true });
                console.log(`[AUTH] [${timestamp}] VERIFY TOKEN - User document created`);
            } catch (error) {
                console.error(`[AUTH] [${timestamp}] VERIFY TOKEN - Error creating user document:`, error.message);
                // Continue even if Firestore write fails - user is authenticated
            }
        } else {
            // Update existing user with latest info
            console.log(`[AUTH] [${timestamp}] VERIFY TOKEN - Updating existing user document`);
            try {
                await updateDoc(userRef, {
                    displayName: userName,
                    photoURL: userPhoto,
                    lastLoginAt: serverTimestamp()
                });
            } catch (error) {
                console.error(`[AUTH] [${timestamp}] VERIFY TOKEN - Error updating user document:`, error.message);
                // Continue even if update fails
            }
        }

        // Generate JWT token for our app session
        const token = jwt.sign(
            { uid, email: userEmail, displayName: userName, photoURL: userPhoto },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('jwt_token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/'
        });

        console.log(`[AUTH] [${timestamp}] VERIFY TOKEN SUCCESS - UID: ${uid}, Email: ${userEmail}`);

        res.status(200).json({
            token,
            user: { uid, email: userEmail, displayName: userName, photoURL: userPhoto }
        });
    } catch (error) {
        console.error(`[AUTH] [${timestamp}] VERIFY TOKEN FAILED - Error: ${error.code || 'UNKNOWN'}, Message: ${error.message || 'Unknown error'}`);
        console.error('[VERIFY-TOKEN] Unexpected error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message || 'Failed to verify token'
        });
    }
});

// Debug middleware to log all requests to this router
router.use((req, res, next) => {
    console.log(`[USER ROUTES] ${req.method} ${req.path}`);
    next();
});

// Public route - Signup: Create new user in Firebase Auth
router.post('/signup', async (req, res) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    console.log(`[AUTH] [${timestamp}] SIGNUP ATTEMPT - IP: ${ip}`);
    console.log(`[AUTH] [${timestamp}] SIGNUP - Email: ${req.body.email || 'NOT PROVIDED'}, DisplayName: ${req.body.displayName || 'NOT PROVIDED'}`);
    try {
        const { email, password, displayName } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (!email.includes('@')) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Create user in Firebase Auth
        console.log('[SIGNUP] Creating user in Firebase Auth...');
        const userInfo = await createUser(email, password, displayName);
        
        if (userInfo) {
            const { uid, email: userEmail, displayName: userName, photoURL } = userInfo;
            console.log(`[AUTH] [${new Date().toISOString()}] SIGNUP SUCCESS - UID: ${uid}, Email: ${userEmail}`);
            
            // Create user document in Firestore (non-blocking - don't fail signup if this fails)
            try {
                const { db } = require('../config/firebase');
                const { doc, setDoc, serverTimestamp } = require('firebase/firestore');
                await setDoc(doc(db, 'users', uid), {
                    email: userEmail,
                    displayName: userName || '',
                    photoURL: photoURL || '',
                    createdAt: serverTimestamp(),
                    businessId: null,
                    employeeId: null
                }, { merge: true });
                console.log('[SIGNUP] ✅ User document created in Firestore');
            } catch (firestoreError) {
                // Log but don't fail signup - Firestore document can be created later
                console.warn('[SIGNUP] ⚠️  Firestore write failed (non-critical):', firestoreError.message);
                console.warn('[SIGNUP] User is created in Firebase Auth but Firestore document creation failed.');
                console.warn('[SIGNUP] This is OK - the user document can be created when needed.');
            }

            // Generate JWT token
            const token = jwt.sign(
                { uid, email: userEmail, displayName: userName, photoURL },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Set cookie with JWT token
            res.cookie('jwt_token', token, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
                path: '/'
            });

            res.status(201).json({
                token,
                user: { uid, email: userEmail, displayName: userName, photoURL },
                message: 'User created successfully'
            });
        } else {
            res.status(400).json({ error: 'Failed to create user. User may already exist.' });
        }
    } catch (error) {
        console.error('[SIGNUP] Error:', error.code || 'UNKNOWN', error.message);
        
        if (error.code === 'PERMISSION_DENIED' || error.message?.includes('serviceUsageConsumer')) {
            return res.status(403).json({ 
                error: 'Service account missing required permissions',
                message: 'Please add "Service Usage Consumer" role to your service account',
                helpUrl: 'https://console.cloud.google.com/iam-admin/iam?project=locallu-locallu',
                details: 'Grant roles/serviceusage.serviceUsageConsumer role to: firebase-adminsdk-fbsvc@locallu-locallu.iam.gserviceaccount.com'
            });
        }
        
        if (error.code === 'auth/email-already-exists') {
            console.log(`[AUTH] [${new Date().toISOString()}] SIGNUP FAILED - Email already exists: ${req.body.email}`);
            res.status(409).json({ error: 'Email already registered. Please login instead.' });
        } else if (error.code === 'auth/invalid-email') {
            console.log(`[AUTH] [${new Date().toISOString()}] SIGNUP FAILED - Invalid email format: ${req.body.email}`);
            res.status(400).json({ error: 'Invalid email format' });
        } else if (error.code === 'auth/weak-password') {
            console.log(`[AUTH] [${new Date().toISOString()}] SIGNUP FAILED - Weak password for: ${req.body.email}`);
            res.status(400).json({ error: 'Password is too weak' });
        } else {
            console.log(`[AUTH] [${new Date().toISOString()}] SIGNUP FAILED - Error: ${error.code || 'UNKNOWN'}, Message: ${error.message || 'Unknown error'}`);
            res.status(500).json({ 
                error: error.message || 'Internal server error',
                code: error.code || 'UNKNOWN'
            });
        }
    }
});

// Public route - Login: Get JWT token from email (Firebase Auth)
router.get('/getUserId', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        if (!email.includes('@')) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const userInfo = await getUserInfoFromEmail(email);
        if (userInfo) {
            const { uid, email: userEmail, displayName, photoURL } = userInfo;
            const token = jwt.sign(
                { uid, email: userEmail, displayName, photoURL },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Set cookie with JWT token
            res.cookie('jwt_token', token, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
                path: '/'
            });

            res.status(200).json({ token, user: { uid, email: userEmail, displayName, photoURL } });
        } else {
            res.status(404).json({ error: 'User not found. Please sign up first.' });
        }
    } catch (error) {
        console.error('[LOGIN] Error:', error.code || 'UNKNOWN', error.message);
        
        if (error.code === 'PERMISSION_DENIED' || error.message?.includes('serviceUsageConsumer')) {
            return res.status(403).json({ 
                error: 'Service account missing required permissions',
                message: 'Please add "Service Usage Consumer" role to your service account',
                helpUrl: 'https://console.cloud.google.com/iam-admin/iam?project=locallu-locallu',
                details: 'Grant roles/serviceusage.serviceUsageConsumer role to: firebase-adminsdk-fbsvc@locallu-locallu.iam.gserviceaccount.com'
            });
        }
        
        res.status(500).json({ 
            error: 'Internal server error',
            code: error.code || 'UNKNOWN',
            message: error.message
        });
    }
});

// Public route - Login with password (Firebase Auth)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Sign in with password using Firebase REST API
        // This will verify the password and return user info if successful
        const userInfo = await signInUser(email, password);
        
        if (userInfo) {
            const { uid, email: userEmail, displayName, photoURL } = userInfo;
            
            // Ensure user document exists in Firestore (non-blocking - don't fail login if this fails)
            try {
                const { db } = require('../config/firebase');
                const { doc, setDoc, getDoc, serverTimestamp } = require('firebase/firestore');
                const userRef = doc(db, 'users', uid);
                const userDoc = await getDoc(userRef);
                
                if (!userDoc.exists()) {
                    // Create user document if it doesn't exist
                    await setDoc(userRef, {
                        email: userEmail,
                        displayName: displayName || '',
                        photoURL: photoURL || '',
                        createdAt: serverTimestamp(),
                        businessId: null,
                        employeeId: null
                    }, { merge: true });
                    console.log('[LOGIN] ✅ User document created in Firestore');
                }
            } catch (firestoreError) {
                // Log but don't fail login - Firestore document can be created later
                console.warn('[LOGIN] ⚠️  Firestore write failed (non-critical):', firestoreError.message);
            }
            
            // Generate JWT token
            const token = jwt.sign(
                { uid, email: userEmail, displayName, photoURL },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Set cookie with JWT token
            res.cookie('jwt_token', token, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
                path: '/'
            });

            console.log(`[AUTH] [${new Date().toISOString()}] LOGIN SUCCESS - UID: ${uid}, Email: ${userEmail}`);
            res.status(200).json({
                token,
                user: { uid, email: userEmail, displayName, photoURL }
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('[LOGIN POST] Error:', error.code || 'UNKNOWN', error.message);
        
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            console.log(`[AUTH] [${new Date().toISOString()}] LOGIN FAILED - Invalid credentials for: ${req.body.email}`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        if (error.code === 'PERMISSION_DENIED' || error.message?.includes('serviceUsageConsumer')) {
            console.log(`[AUTH] [${new Date().toISOString()}] LOGIN FAILED - Permission denied`);
            return res.status(403).json({ 
                error: 'Service account missing required permissions',
                message: 'Please add "Service Usage Consumer" role to your service account',
                helpUrl: 'https://console.cloud.google.com/iam-admin/iam?project=locallu-locallu',
                details: 'Grant roles/serviceusage.serviceUsageConsumer role to: firebase-adminsdk-fbsvc@locallu-locallu.iam.gserviceaccount.com'
            });
        }
        
        console.log(`[AUTH] [${new Date().toISOString()}] LOGIN FAILED - Error: ${error.code || 'UNKNOWN'}, Message: ${error.message || 'Unknown error'}`);
        res.status(500).json({ 
            error: 'Internal server error',
            code: error.code || 'UNKNOWN',
            message: error.message
        });
    }
});

// Refresh token endpoint - extends session by generating new token
router.post('/refresh-token', authenticateToken, async (req, res) => {
    try {
        const { uid, email, displayName, photoURL } = req.user;

        const newToken = jwt.sign(
            { uid, email, displayName, photoURL },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('jwt_token', newToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/'
        });

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

// Public route - Google OAuth callback
router.post('/google-auth', async (req, res) => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    console.log(`[AUTH] [${timestamp}] GOOGLE AUTH ATTEMPT - IP: ${ip}`);
    console.log(`[AUTH] [${timestamp}] GOOGLE AUTH - Email: ${req.body.email || 'NOT PROVIDED'}, DisplayName: ${req.body.displayName || 'NOT PROVIDED'}`);
    try {
        const { idToken, displayName, email, photoURL } = req.body;
        
        if (!idToken) {
            console.log(`[AUTH] [${new Date().toISOString()}] GOOGLE AUTH FAILED - No ID token provided`);
            return res.status(400).json({ error: 'ID token is required' });
        }

        console.log(`[AUTH] [${timestamp}] GOOGLE AUTH - Starting token verification...`);
        
        // Verify the Google ID token using Firebase REST API
        const { db } = require('../config/firebase');
        const { doc, setDoc, getDoc, updateDoc, serverTimestamp } = require('firebase/firestore');
        let decodedToken;
        try {
            // Use verifyIdToken from userController (uses REST API)
            decodedToken = await verifyIdToken(idToken);
            console.log('[GOOGLE-AUTH] Token verified in', Date.now() - startTime, 'ms');
        } catch (error) {
            console.error('[GOOGLE-AUTH] Error verifying Google token:', error);
            if (error.code === 'auth/id-token-expired') {
                return res.status(401).json({ error: 'Google ID token expired. Please sign in again.' });
            }
            return res.status(401).json({ error: 'Invalid Google token: ' + (error.message || 'Unknown error') });
        }

        const { uid, email: userEmail, name, picture } = decodedToken;
        const userName = displayName || name || '';
        const userPhoto = photoURL || picture || '';

        console.log('[GOOGLE-AUTH] User verified:', { uid, email: userEmail });

        // Check if user exists in Firestore, create if not
        const userRef = doc(db, 'users', uid);
        let userDoc;
        try {
            userDoc = await getDoc(userRef);
        } catch (error) {
            console.error('[GOOGLE-AUTH] Error getting user document:', error);
            return res.status(500).json({ error: 'Database error: ' + error.message });
        }
        
        if (!userDoc.exists()) {
            // Create user document
            console.log('[GOOGLE-AUTH] Creating new user document');
            try {
                await setDoc(userRef, {
                    email: userEmail,
                    displayName: userName,
                    photoURL: userPhoto,
                    createdAt: serverTimestamp(),
                    businessId: null,
                    employeeId: null,
                    authProvider: 'google'
                }, { merge: true });
            } catch (error) {
                console.error('[GOOGLE-AUTH] Error creating user document:', error);
                return res.status(500).json({ error: 'Failed to create user: ' + error.message });
            }
        } else {
            // Update existing user with latest info
            console.log('[GOOGLE-AUTH] Updating existing user');
            try {
                await updateDoc(userRef, {
                    displayName: userName,
                    photoURL: userPhoto,
                    lastLoginAt: serverTimestamp()
                });
            } catch (error) {
                console.error('[GOOGLE-AUTH] Error updating user:', error);
                // Continue even if update fails
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { uid, email: userEmail, displayName: userName, photoURL: userPhoto },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('jwt_token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
            path: '/'
        });

        console.log('[GOOGLE-AUTH] Authentication successful in', Date.now() - startTime, 'ms');

        res.status(200).json({
            token,
            user: { uid, email: userEmail, displayName: userName, photoURL: userPhoto }
        });
    } catch (error) {
        console.log(`[AUTH] [${new Date().toISOString()}] GOOGLE AUTH FAILED - Error: ${error.code || 'UNKNOWN'}, Message: ${error.message || 'Unknown error'}`);
        console.error('[GOOGLE-AUTH] Unexpected error:', error);
        console.error('[GOOGLE-AUTH] Stack:', error.stack);
        res.status(500).json({ 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'production' ? 'Authentication failed' : error.message
        });
    }
});

// Deprecated - kept for backward compatibility
router.get('/getUpdatedToken', async (req, res) => {
    try {
        const taskID = req.query.taskID;
        let token = req.query.token;

        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token || !taskID) {
            return res.status(400).json({ error: 'token or taskID cannot be found' });
        }

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired token' });
            }

            const newPayload = { ...decoded, taskID };
            const updatedToken = jwt.sign(newPayload, JWT_SECRET, { expiresIn: '24h' });
            res.status(200).json({ updatedToken });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// IMPORTANT: Parameterized routes MUST be last to avoid route conflicts
// Protected routes - get business/employee ID for authenticated user
router.get('/:uid', authenticateToken, getBusinessIDByUserID);
router.get('/emp/:uid', authenticateToken, getEmployeeIDByUserID);

module.exports = router;
