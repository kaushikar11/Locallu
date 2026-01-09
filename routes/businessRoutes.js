// routes/businessRoutes.js

const express = require('express');
const multer = require('multer');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// Middleware to log the date and time of request
router.use((req, res, next) => {
    console.log(`Request received at ${new Date().toISOString()}`);
    next();
});

// Public routes
router.get('/check-email/:email', businessController.checkEmailExists);
router.get('/:businessId', optionalAuth, businessController.getBusinessDetailsByID);
router.get('/profile/:businessId', optionalAuth, businessController.getProfilePicture);

// Protected routes (auth required)
router.post('/', authenticateToken, businessController.addBusiness);
router.post('/uploadImage', authenticateToken, upload.single('businessImage'), businessController.uploadImage);
router.put('/:id', authenticateToken, businessController.updateBusinessDetail);
router.put('/:id/updateProfilePicture', authenticateToken, upload.single('profilePicture'), businessController.updateProfilePicture);

module.exports = router;
