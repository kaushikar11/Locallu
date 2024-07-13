//taskroutes.js code

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/every', async (req, res) => {
    try {
        await taskController.getEveryTask(req, res);
    } catch (error) {
        console.error('Router Error - Get Every Task:', error);
        res.status(500).json({ error: 'Failed to fetch all tasks' });
    }
});

// router.get('/notAssigned', async (req, res) => {
//     try {
//         await taskController.getNotAssignedTasks(req, res);
//     } catch (error) {
//         console.error('Router Error - Get Not Assigned Tasks:', error);
//         res.status(500).json({ error: 'Failed to fetch not assigned tasks' });
//     }
// });

router.get('/notassigned', taskController.fetchAllNotAssignedTasks);

router.get('/assigned/:employeeId', taskController.fetchTasksByEmployeeId);

router.put('/assign/:taskId/:empId', async (req, res) => {
    try {
        await taskController.assignTask(req, res);
    } catch (error) {
        console.error('Error assigning task:', error.message);
        res.status(500).json({ error: 'Failed to assign task' });
    }
});
router.put('/unassign/:taskId', async (req, res) => {
    try {
        await taskController.unassignTask(req, res);
    } catch (error) {
        console.error('Error unassigning task:', error.message);
        res.status(500).json({ error: 'Failed to unassign task' });
    }
});
router.put('/submit/:taskId', taskController.submit);

router.get('/detail/:taskID', taskController.getTaskByTaskID);

// Route for handling file uploads related to tasks
//router.post('/:taskId/upload', upload.single('file'), taskController.uploadFile);
router.post('/', taskController.createTask);

// Example route to get tasks by business ID
router.get('/business/:businessId', taskController.getTasksByBusiness);
router.get('/employee/:employeeId', taskController.getTasksByEmployee);
//Example route to get tasks by a taskID
router.get('/:taskID', taskController.getTaskByTaskID);
router.delete('/delete/:taskID', taskController.deleteTaskById);
router.put('/update/:taskID', taskController.updateTask);


module.exports = router;