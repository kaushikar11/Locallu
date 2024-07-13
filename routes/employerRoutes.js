const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');

router.post('/add', employerController.addEmployer);
router.get('/', employerController.getAllEmployers);
router.get('/:id', employerController.getEmployerById);
router.delete('/:id', employerController.deleteEmployer);

module.exports = router;
