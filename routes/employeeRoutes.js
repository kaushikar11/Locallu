// routes/employeeRoutes.js

const express = require('express');
const multer = require('multer');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to log the date and time of request
router.use((req, res, next) => {
    console.log(`Request received at ${new Date().toISOString()}`);
    next();
});

// Public routes
router.get('/check-email/:email', employeeController.checkEmailExistsinEmp);
router.get('/:employeeId', optionalAuth, employeeController.getEmployeeDetailsByID);
router.get('/profile/:employeeId', optionalAuth, employeeController.getProfilePicture);

// Protected routes (auth required)
router.post('/', authenticateToken, employeeController.addEmployee);
router.post('/uploadImage', authenticateToken, upload.single('employeeImage'), employeeController.uploadImage);
router.put('/:id', authenticateToken, employeeController.updateEmployeeDetails);
router.put('/:id/updateProfilePicture', authenticateToken, upload.single('profilePicture'), employeeController.updateProfilePicture);

module.exports = router;

