//taskcontroller.js code

const { db } = require('../config/firebase');
const { Task, TASK_STATUS, isValidStatusTransition } = require('../models/taskModel');

// Helper function to format task from Firestore
function formatTaskFromFirestore(doc) {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        price: data.price,
        description: data.description,
        dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : new Date(data.dueDate),
        dateCreated: data.dateCreated?.toDate ? data.dateCreated.toDate() : new Date(data.dateCreated),
        status: data.status || TASK_STATUS.PENDING,
        isAssigned: data.isAssigned || false,
        assignedTo: data.assignedTo || null,
        businessId: data.businessId,
        solution: data.solution || '',
        reviewComments: data.reviewComments || null,
        reviewedAt: data.reviewedAt?.toDate ? data.reviewedAt.toDate() : (data.reviewedAt ? new Date(data.reviewedAt) : null),
        reviewedBy: data.reviewedBy || null
    };
}

// Assign task to employee
exports.assignTask = async (req, res) => {
    const { taskId, empId } = req.params;

    try {
        const taskRef = db.collection('tasks').doc(taskId);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const currentData = taskDoc.data();
        const currentStatus = currentData.status || TASK_STATUS.PENDING;

        // Validate status transition
        if (currentStatus !== TASK_STATUS.PENDING && currentStatus !== TASK_STATUS.REJECTED) {
            return res.status(400).json({ 
                error: `Cannot assign task in status: ${currentStatus}. Task must be 'pending' or 'rejected'.` 
            });
        }

        // Update task with assignment and status change
        await taskRef.update({
            assignedTo: empId,
            isAssigned: true,
            status: TASK_STATUS.ASSIGNED,
            assignedAt: new Date()
        });

        res.json({ message: 'Task assigned successfully', status: TASK_STATUS.ASSIGNED });
    } catch (error) {
        console.error('Error assigning task:', error.message);
        res.status(500).json({ error: 'Failed to assign task' });
    }
};

// Unassign a task
exports.unassignTask = async (req, res) => {
    const { taskId } = req.params;

    try {
        const taskRef = db.collection('tasks').doc(taskId);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const currentData = taskDoc.data();
        const currentStatus = currentData.status || TASK_STATUS.ASSIGNED;

        // Only allow unassigning if task is assigned or in progress
        if (currentStatus !== TASK_STATUS.ASSIGNED && currentStatus !== TASK_STATUS.IN_PROGRESS) {
            return res.status(400).json({ 
                error: `Cannot unassign task in status: ${currentStatus}` 
            });
        }

        await taskRef.update({
            assignedTo: null,
            isAssigned: false,
            status: TASK_STATUS.PENDING,
            unassignedAt: new Date()
        });

        res.json({ message: 'Task unassigned successfully', status: TASK_STATUS.PENDING });
    } catch (error) {
        console.error('Error unassigning task:', error.message);
        res.status(500).json({ error: 'Failed to unassign task' });
    }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
    const { taskId } = req.params;
    const { newStatus, comments } = req.body;

    try {
        const taskRef = db.collection('tasks').doc(taskId);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const currentData = taskDoc.data();
        const currentStatus = currentData.status || TASK_STATUS.PENDING;

        // Validate status transition
        if (!isValidStatusTransition(currentStatus, newStatus)) {
            return res.status(400).json({ 
                error: `Invalid status transition from '${currentStatus}' to '${newStatus}'` 
            });
        }

        const updateData = {
            status: newStatus,
            statusUpdatedAt: new Date()
        };

        // Special handling for status-specific fields
        if (newStatus === TASK_STATUS.IN_PROGRESS && currentStatus === TASK_STATUS.ASSIGNED) {
            updateData.startedAt = new Date();
        }

        if (comments) {
            updateData.statusComments = comments;
        }

        await taskRef.update(updateData);

        res.json({ 
            message: 'Task status updated successfully', 
            status: newStatus,
            previousStatus: currentStatus
        });
    } catch (error) {
        console.error('Error updating task status:', error.message);
        res.status(500).json({ error: 'Failed to update task status' });
    }
};

// Get task by ID
exports.getTaskByTaskID = async (req, res) => {
    try {
        const { taskID } = req.params;
        const taskRef = db.collection('tasks').doc(taskID);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const task = formatTaskFromFirestore(taskDoc);
        res.status(200).json(task);
    } catch (error) {
        console.error('Error fetching task by taskID:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get tasks by business ID
exports.getTasksByBusiness = async (req, res, next) => {
    try {
        const businessId = req.params.businessId;

        const snapshot = await db.collection('tasks').where('businessId', '==', businessId).get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const tasks = [];
        snapshot.forEach(doc => {
            tasks.push(formatTaskFromFirestore(doc));
        });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

// Get tasks by employee ID
exports.getTasksByEmployee = async (req, res, next) => {
    try {
        const employeeId = req.params.employeeId;

        const snapshot = await db.collection('tasks').where('employeeId', '==', employeeId).get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const tasks = [];
        snapshot.forEach(doc => {
            tasks.push(formatTaskFromFirestore(doc));
        });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

// Submit solution for a task
exports.submit = async (req, res) => {
    const { taskId } = req.params;
    const { solution } = req.body;

    if (!solution || solution.trim() === '') {
        return res.status(400).json({ error: 'Solution is required' });
    }

    try {
        const taskRef = db.collection('tasks').doc(taskId);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const currentData = taskDoc.data();
        const currentStatus = currentData.status || TASK_STATUS.ASSIGNED;

        // Only allow submission if task is assigned or in progress
        if (currentStatus !== TASK_STATUS.ASSIGNED && currentStatus !== TASK_STATUS.IN_PROGRESS) {
            return res.status(400).json({ 
                error: `Cannot submit solution for task in status: ${currentStatus}. Task must be 'assigned' or 'in_progress'.` 
            });
        }

        // Update task with solution and change status to submitted
        await taskRef.update({
            solution: solution.trim(),
            status: TASK_STATUS.SUBMITTED,
            submittedAt: new Date()
        });

        res.json({ 
            message: 'Solution submitted successfully',
            status: TASK_STATUS.SUBMITTED
        });
    } catch (error) {
        console.error('Error submitting solution:', error.message);
        res.status(500).json({ error: 'Failed to submit solution' });
    }
};

// Review task solution (business only)
exports.reviewTask = async (req, res) => {
    const { taskId } = req.params;
    const { action, reviewComments } = req.body; // action: 'approve' | 'reject' | 'request_changes'
    const userId = req.user?.uid;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!['approve', 'reject', 'request_changes'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action. Must be approve, reject, or request_changes' });
    }

    try {
        const taskRef = db.collection('tasks').doc(taskId);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const currentData = taskDoc.data();
        const currentStatus = currentData.status || TASK_STATUS.SUBMITTED;

        // Only allow review if task is submitted
        if (currentStatus !== TASK_STATUS.SUBMITTED) {
            return res.status(400).json({ 
                error: `Cannot review task in status: ${currentStatus}. Task must be 'submitted'.` 
            });
        }

        // Verify business owns this task
        const businessRef = db.collection('users').doc(userId);
        const businessDoc = await businessRef.get();
        if (!businessDoc.exists || businessDoc.data().businessId !== currentData.businessId) {
            return res.status(403).json({ error: 'You do not have permission to review this task' });
        }

        let newStatus;
        const updateData = {
            reviewedAt: new Date(),
            reviewedBy: userId,
            reviewComments: reviewComments || null
        };

        switch (action) {
            case 'approve':
                newStatus = TASK_STATUS.APPROVED;
                updateData.approvedAt = new Date();
                break;
            case 'reject':
                newStatus = TASK_STATUS.REJECTED;
                updateData.rejectedAt = new Date();
                break;
            case 'request_changes':
                newStatus = TASK_STATUS.IN_PROGRESS;
                updateData.changesRequestedAt = new Date();
                break;
        }

        updateData.status = newStatus;
        await taskRef.update(updateData);

        res.json({ 
            message: `Task ${action} successfully`,
            status: newStatus,
            reviewComments
        });
    } catch (error) {
        console.error('Error reviewing task:', error.message);
        res.status(500).json({ error: 'Failed to review task' });
    }
};

// Create a new task
exports.createTask = async (req, res, next) => {
    try {
        const { name, price, description, dueDate, businessId } = req.body;
        const userId = req.user?.uid;

        // Validate incoming data
        if (!name || !price || !description || !dueDate || !businessId) {
            return res.status(400).json({ error: 'Missing required fields: name, price, description, dueDate, businessId' });
        }

        // Verify business ownership if user is authenticated
        if (userId) {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            if (userDoc.exists && userDoc.data().businessId !== businessId) {
                return res.status(403).json({ error: 'You do not have permission to create tasks for this business' });
            }
        }

        // Create new task object with proper defaults
        const newTask = {
            name: name.trim(),
            price: parseFloat(price),
            description: description.trim(),
            dueDate: new Date(dueDate),
            dateCreated: new Date(),
            status: TASK_STATUS.PENDING,
            isAssigned: false,
            assignedTo: null,
            businessId: businessId,
            solution: '',
            reviewComments: null,
            reviewedAt: null,
            reviewedBy: null
        };

        // Add the new task to the 'tasks' collection
        const taskRef = await db.collection('tasks').add(newTask);
        const taskId = taskRef.id;

        // Update the 'tasks' array in the corresponding 'business' document
        const businessRef = db.collection('businesses').doc(businessId);
        const businessDoc = await businessRef.get();

        if (!businessDoc.exists) {
            // If business doesn't exist, delete the task and return error
            await taskRef.delete();
            return res.status(404).json({ error: 'Business not found' });
        }

        // Update the 'tasks' array in the business document
        const tasksArray = businessDoc.data().tasks || [];
        tasksArray.push(taskId);

        await businessRef.update({ tasks: tasksArray });

        res.status(201).json({ 
            taskId,
            task: {
                id: taskId,
                ...newTask,
                dueDate: newTask.dueDate.toISOString(),
                dateCreated: newTask.dateCreated.toISOString()
            }
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
};

// Delete task
exports.deleteTaskById = async (req, res, next) => {
    try {
        const taskID = req.params.taskID;
        const userId = req.user?.uid;

        const taskRef = db.collection('tasks').doc(taskID);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Verify ownership if user is authenticated
        if (userId) {
            const taskData = taskDoc.data();
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            if (userDoc.exists && userDoc.data().businessId !== taskData.businessId) {
                return res.status(403).json({ error: 'You do not have permission to delete this task' });
            }
        }

        // Remove task from business tasks array
        const taskData = taskDoc.data();
        if (taskData.businessId) {
            const businessRef = db.collection('businesses').doc(taskData.businessId);
            const businessDoc = await businessRef.get();
            if (businessDoc.exists) {
                const tasksArray = businessDoc.data().tasks || [];
                const updatedTasksArray = tasksArray.filter(id => id !== taskID);
                await businessRef.update({ tasks: updatedTasksArray });
            }
        }

        // Delete the task
        await taskRef.delete();

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};

// Get tasks assigned to employee
exports.fetchTasksByEmployeeId = async (req, res) => {
    const { employeeId } = req.params;

    try {
        const tasksRef = db.collection('tasks');
        const querySnapshot = await tasksRef.where('assignedTo', '==', employeeId).get();

        if (querySnapshot.empty) {
            return res.status(200).json([]);
        }

        const tasks = [];
        querySnapshot.forEach(doc => {
            tasks.push(formatTaskFromFirestore(doc));
        });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        res.status(500).json({ message: 'Failed to fetch tasks' });
    }
};

// Update task details
exports.updateTask = async (req, res) => {
    try {
        const taskID = req.params.taskID;
        const { description, price, dueDate, name } = req.body;
        const userId = req.user?.uid;

        // Validate incoming data
        if (!description && !price && !dueDate && !name) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const taskRef = db.collection('tasks').doc(taskID);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Verify ownership if user is authenticated
        if (userId) {
            const taskData = taskDoc.data();
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            if (userDoc.exists && userDoc.data().businessId !== taskData.businessId) {
                return res.status(403).json({ error: 'You do not have permission to update this task' });
            }
        }

        // Prepare updated fields
        const updatedFields = {};
        if (description) updatedFields.description = description.trim();
        if (price !== undefined) updatedFields.price = parseFloat(price);
        if (dueDate) updatedFields.dueDate = new Date(dueDate);
        if (name) updatedFields.name = name.trim();

        updatedFields.updatedAt = new Date();

        // Update the task document in Firestore
        await taskRef.update(updatedFields);

        // Fetch the updated task
        const updatedTaskDoc = await taskRef.get();
        const task = formatTaskFromFirestore(updatedTaskDoc);

        res.status(200).json(task);
    } catch (error) {
        console.error('Error updating task fields:', error);
        res.status(500).json({ error: 'Failed to update task fields' });
    }
};

// Get all unassigned tasks
exports.fetchAllNotAssignedTasks = async (req, res) => {
    try {
        const snapshot = await db.collection('tasks')
            .where('isAssigned', '==', false)
            .where('status', '==', TASK_STATUS.PENDING)
            .get();

        const tasks = [];
        snapshot.forEach(doc => {
            tasks.push(formatTaskFromFirestore(doc));
        });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        res.status(500).json({ error: 'Failed to fetch not assigned tasks' });
    }
};
