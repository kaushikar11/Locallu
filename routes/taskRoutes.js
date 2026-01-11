//taskroutes.js code

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

// Public routes (no auth required) - order matters! More specific routes first
router.get('/notassigned', taskController.fetchAllNotAssignedTasks);
router.get('/all', optionalAuth, taskController.getAllTasks); // Get all tasks with pagination
router.get('/business/:businessId', optionalAuth, taskController.getTasksByBusiness);
router.get('/employee/:employeeId', optionalAuth, taskController.getTasksByEmployee);
router.get('/assigned/:employeeId', optionalAuth, taskController.fetchTasksByEmployeeId);
router.get('/detail/:taskID', taskController.getTaskByTaskID);
router.get('/:taskID', taskController.getTaskByTaskID); // Must be last due to route parameter

// Protected routes (auth required)
router.post('/', authenticateToken, taskController.createTask);
router.put('/assign/:taskId/:empId', authenticateToken, taskController.assignTask);
router.put('/unassign/:taskId', authenticateToken, taskController.unassignTask);
router.put('/submit/:taskId', authenticateToken, taskController.submit);
router.put('/review/:taskId', authenticateToken, taskController.reviewTask);
router.put('/status/:taskId', authenticateToken, taskController.updateTaskStatus);
router.put('/update/:taskID', authenticateToken, taskController.updateTask);
router.delete('/delete/:taskID', authenticateToken, taskController.deleteTaskById);

module.exports = router;