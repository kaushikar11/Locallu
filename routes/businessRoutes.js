// routes/businessRoutes.js

const express = require('express');
const multer = require('multer');
const router = express.Router();
const businessController = require('../controllers/businessController');

const upload = multer({ storage: multer.memoryStorage() });

// Middleware to log the date and time of request
router.use((req, res, next) => {
    console.log(`Request received at ${new Date().toISOString()}`);
    next();
});

// Route to create a new business
router.post('/', businessController.addBusiness);
router.post('/uploadImage', upload.single('businessImage'), businessController.uploadImage);
// New route to get business details by user ID
router.get('/:businessId', businessController.getBusinessDetailsByID);
router.put('/:id', businessController.updateBusinessDetail);
router.put('/:id/updateProfilePicture', upload.single('profilePicture'), businessController.updateProfilePicture);
router.get('/profile/:businessId', businessController.getProfilePicture);
router.get('/check-email/:email', businessController.checkEmailExists);

module.exports = router;
