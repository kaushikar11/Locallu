// routes/employeeRoutes.js

const express = require('express');
const multer = require('multer');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to log the date and time of request
router.use((req, res, next) => {
    console.log(`Request received at ${new Date().toISOString()}`);
    next();
});

// Route to create a new employee
router.post('/', employeeController.addEmployee);
router.post('/uploadImage', upload.single('employeeImage'), employeeController.uploadImage);
// New route to get employee details by user ID
router.get('/:employeeId', employeeController.getEmployeeDetailsByID);
router.get('/profile/:employeeId', employeeController.getProfilePicture);
router.get('/check-email/:email', employeeController.checkEmailExistsinEmp);

module.exports = router;

