//taskcontroller.js code

const { db } = require('../config/firebase');
const Task = require('../models/taskModel');


exports.assignTask = async (req, res) => {
    const { taskId, empId } = req.params;

    try {
        // Fetch the task by ID
        const taskRef = db.collection('tasks').doc(taskId);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update the task with the assigned employee ID
        await taskRef.update({ assignedTo: empId , isAssigned:true});

        // Respond with success message
        res.json({ message: 'Task assigned successfully' });
    } catch (error) {
        console.error('Error assigning task:', error.message);
        res.status(500).json({ error: 'Failed to assign task' });
    }
};

// Unassign a task (set isAssigned to false)
exports.unassignTask = async (req, res) => {
    const { taskId} = req.params;

    try {
        // Fetch the task by ID
        const taskRef = db.collection('tasks').doc(taskId);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update the task with the assigned employee ID
        await taskRef.update({ assignedTo: null , isAssigned:false});

        // Respond with success message
        res.json({ message: 'Task assigned successfully' });
    } catch (error) {
        console.error('Error assigning task:', error.message);
        res.status(500).json({ error: 'Failed to assign task' });
    }

};

exports.getTaskByTaskID = async (req, res) => {
    try {
        const { taskID } = req.params;
        //console.log(taskID);
        // Fetch the task from Firestore
        const taskRef = db.collection('tasks').doc(taskID);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Parse task data into Task model
        const data = taskDoc.data();
        const task = {
            id: taskDoc.id,
            name: data.name,
            price: data.price,
            description: data.description,
            dueDate: data.dueDate.toDate(), // Assuming dueDate is stored as Firestore timestamp
            dateCreated: data.dateCreated.toDate(), // Assuming dateCreated is stored as Firestore timestamp
            status: data.status,
            isAssigned: data.isAssigned,
            assignedTo: data.assignedTo,
            businessId: data.businessId,
            solution:data.solution
        };

        // Return the task as JSON response
        res.status(200).json(task);
    } catch (error) {
        console.error('Error fetching task by taskID:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Controller function to get tasks by business ID
exports.getTasksByBusiness = async (req, res, next) => {
    try {
        const businessId = req.params.businessId;

        const snapshot = await db.collection('tasks').where('businessId', '==', businessId).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'No tasks found' });
        }

        const tasks = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            tasks.push(new Task(
                doc.id,
                data.name,
                data.price,
                data.description,
                data.dueDate.toDate(), // assuming dueDate is stored as Firestore timestamp
                data.dateCreated.toDate(), // assuming dateCreated is stored as Firestore timestamp
                data.status,
                data.isAssigned,
                data.assignedTo,
                data.businessId,
                data.solution
            ));
        });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

exports.getTasksByEmployee = async (req, res, next) => {
    try {
        const employeeId = req.params.employeeId;

        const snapshot = await db.collection('tasks').where('employeeId', '==', employeeId).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'No tasks found' });
        }

        const tasks = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            tasks.push(new Task(
                doc.id,
                data.name,
                data.price,
                data.description,
                data.dueDate.toDate(), // assuming dueDate is stored as Firestore timestamp
                data.dateCreated.toDate(), // assuming dateCreated is stored as Firestore timestamp
                data.status,
                data.isAssigned,
                data.assignedTo,
                data.businessId,
                data.solution
            ));
        });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};
exports.submit = async (req, res) => {
    const { taskId } = req.params;
    const { solution } = req.body;

    try {
        // Fetch the task from Firestore
        const taskRef = db.collection('tasks').doc(taskId);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update the task with the submitted solution
        await taskRef.update({ solution : solution
 });

        // Respond with success message
        res.json({ message: 'Solution submitted successfully' });
    } catch (error) {
        console.error('Error submitting solution:', error.message);
        res.status(500).json({ error: 'Failed to submit solution' });
    }
};
// Controller function to create a new task
exports.createTask = async (req, res, next) => {
    try {
        const { name, price, description, dueDate, dateCreated, status, isAssigned, assignedTo, businessId } = req.body;

        // Validate incoming data
        if (!name || !price || !description || !dueDate || !dateCreated || !status || isAssigned === undefined || !businessId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create new task object
        const newTask = {
            name,
            price,
            description,
            dueDate: new Date(dueDate), // convert to JS Date object if necessary
            dateCreated: new Date(dateCreated), // convert to JS Date object if necessary
            status,
            isAssigned,
            assignedTo,
            businessId,
            solution:''
        };

        // Add the new task to the 'tasks' collection
        const taskRef = await db.collection('tasks').add(newTask);
        const taskId = taskRef.id;

        // Update the 'tasks' array in the corresponding 'business' document
        const businessRef = db.collection('businesses').doc(businessId);
        const businessDoc = await businessRef.get();

        if (!businessDoc.exists) {
            return res.status(404).json({ error: 'Business not found' });
        }

        // Update the 'tasks' array in the business document
        const tasksArray = businessDoc.data().tasks || [];
        tasksArray.push(taskId);

        // Update the document with the new tasks array
        await businessRef.update({ tasks: tasksArray });

        // Respond with the taskId that was created
        res.status(201).json({ taskId });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
};

exports.deleteTaskById = async (req, res, next) => {
    try {
        const taskID = req.params.taskID;

        // Delete the task from Firestore
        await db.collection('tasks').doc(taskID).delete();

        // Return success response
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};

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
            const data = doc.data();
            const newTask = {
                name: data.name,
                price: data.price,
                description: data.description,
                dueDate: data.dueDate.toDate(), // convert to JS Date object if necessary
                dateCreated: data.dateCreated.toDate(), // convert to JS Date object if necessary
                status: data.status,
                isAssigned: data.isAssigned,
                assignedTo: data.assignedTo,
                businessId: data.businessId,
                solution:data.solution
            };
            tasks.push({ id: doc.id, ...newTask });
        });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        res.status(500).json({ message: 'Failed to fetch tasks' });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const taskID = req.params.taskID;
        const { description, price, dueDate } = req.body;

        // Validate incoming data
        if (!description && !price && !dueDate) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        // Prepare updated fields
        const updatedFields = {};
        if (description) updatedFields.description = description;
        if (price) updatedFields.price = price;
        if (dueDate) updatedFields.dueDate = new Date(dueDate);

        // Update the task document in Firestore
        const taskRef = db.collection('tasks').doc(taskID);
        await taskRef.update(updatedFields);

        // Fetch the updated task to send back in the response
        const updatedTaskDoc = await taskRef.get();
        if (!updatedTaskDoc.exists) {
            return res.status(404).json({ error: 'Task not found after update' });
        }

        const updatedTaskData = updatedTaskDoc.data();

        // Construct Task model if needed
        const updatedTaskModel = new Task(
            updatedTaskDoc.id,
            updatedTaskData.name,
            updatedTaskData.price,
            updatedTaskData.description,
            updatedTaskData.dueDate.toDate(), // Convert Firestore timestamp to JS Date
            updatedTaskData.status,
            updatedTaskData.isAssigned,
            updatedTaskData.assignedTo,
            updatedTaskData.businessId,
            updatedTaskData.solution
        );

        // Respond with the updated task
        res.status(200).json(updatedTaskModel);
    } catch (error) {
        console.error('Error updating task fields:', error);
        res.status(500).json({ error: 'Failed to update task fields' });
    }
};

exports.fetchAllNotAssignedTasks = async (req, res) => {
    try {
        const snapshot = await db.collection('tasks').where('isAssigned', '==', false).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'No not assigned tasks found' });
        }

        const tasks = [];
        snapshot.forEach(doc => {
            //this code is necessary to format the retrieved task and to properly format date
            const data = doc.data();
            tasks.push({
                id: doc.id,
                name: data.name,
                description: data.description,
                price: data.price,
                dueDate: data.dueDate.toDate(),
                status: data.status,
                isAssigned: data.isAssigned,
                assignedTo: data.assignedTo,
                businessId: data.businessId,
                //solution:solution
            });
        });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        res.status(500).json({ error: 'Failed to fetch not assigned tasks' });
    }
};

//   exports.uploadFile = async (req, res) => {
//     const taskId = req.params.taskId;
//     const file = req.file; // Multer adds the file to req.file object
//     try {
//       // Handle file upload logic, save file path to task or database
//       // Example: Update task with file path
//       const updatedTask = await Task.findByIdAndUpdate(taskId, { filePath: file.path }, { new: true });
//       res.json(updatedTask);
//     } catch (error) {
//       console.error('Error uploading file:', error.message);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   };