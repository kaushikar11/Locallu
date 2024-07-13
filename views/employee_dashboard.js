// const { assign } = require("nodemailer/lib/shared");

document.addEventListener('DOMContentLoaded', async () => {
    // Function to extract token from URL query parameter
    function extractTokenFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('token');
    }

    // Function to decode token and extract user data
    function decodeToken(token) {
        if (!token) {
            console.error('No token found in URL');
            return null;
        }

        try {
            const tokenParts = token.split('.');
            const decodedToken = JSON.parse(atob(tokenParts[1]));
            console.log('Decoded Token:', decodedToken);
            return decodedToken;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    // Extract token from URL
    const token = extractTokenFromURL();
    const userData = decodeToken(token);

    // Function to fetch employee ID by user ID
    async function fetchEmployeeIDByUserID(uid) {
        try {
            const response = await fetch(`/api/users/emp/${uid}`, { method: 'GET' });
            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }
            const userDetails = await response.json();
            console.log('Fetched User Details:', userDetails);
            return userDetails.employeeId;
        } catch (error) {
            console.error('Error fetching user details:', error);
            return null;
        }
    }

    // Function to fetch and display employee details
    async function fetchEmployeeDetails(employeeId) {
        try {
            const response = await fetch(`/api/employees/${employeeId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch employee details (${response.status} ${response.statusText})`);
            }
            const employeeDetails = await response.json();
            console.log('Fetched Employee Details:', employeeDetails);

            // displayEmployeeDetails(employeeDetails);
        } catch (error) {
            console.error('Error fetching employee details:', error.message);
        }
    }



    // Function to display employee details
    // function displayEmployeeDetails(details) {
    //     document.getElementById('employeeName').textContent = details.firstName + ' ' + details.lastName || 'N/A';
    //     document.getElementById('aboutEmployee').textContent = details.aboutEmployee || 'N/A';

    //     let contactInfoHTML = '';
    //     if (details.contactInfo && details.contactInfo.length > 0) {
    //         const labels = ['Email', 'Mobile', 'Social Media'];
    //         details.contactInfo.forEach((info, index) => {
    //             contactInfoHTML += `<p>${labels[index]}: ${info}</p>`;
    //         });
    //     } else {
    //         contactInfoHTML = '<p>No contact information available</p>';
    //     }
    //     document.getElementById('contactInfo').innerHTML = contactInfoHTML;

    //     let skillsHTML = '';
    //     if (details.skills && details.skills.length > 0) {
    //         skillsHTML += '<p>Skills:</p><ul>';
    //         details.skills.forEach(skill => {
    //             skillsHTML += `<li>${skill}</li>`;
    //         });
    //         skillsHTML += '</ul>';
    //     } else {
    //         skillsHTML = '<p>No skills listed</p>';
    //     }
    //     document.getElementById('skills').innerHTML = skillsHTML;
    // }
    const emppromise = fetchEmployeeIDByUserID(userData.uid);
    const empId=await emppromise;
    // const empDetails = await fetchEmployeeDetails(empId);
    console.log(empId);



    // Function to fetch all tasks created by every business
    // async function fetchAllTasks() {
    //     try {
    //         const response = await fetch('/api/tasks/every');
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch tasks');
    //         }
    //         const tasks = await response.json();
    //         console.log('Fetched All Tasks:', tasks);
    //         displayTasks(tasks);
    //     } catch (error) {
    //         console.error('Error fetching tasks:', error.message);
    //         displayTasks([]);
    //     }
    // }

    // // Function to fetch tasks not assigned to any employee
    // async function fetchAllNotAssignedTasks() {
    //     try {
    //         const response = await fetch('/api/tasks/notAssigned');
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch not assigned tasks');
    //         }
    //         const tasks = await response.json();
    //         console.log('Fetched Not Assigned Tasks:', tasks);
    //         displayTasks(tasks);
    //     } catch (error) {
    //         console.error('Error fetching not assigned tasks:', error.message);
    //         displayTasks([]);
    //     }
    // }
    
    async function assignTaskToEmployee(taskId, empId) {
        try {
            const response = await fetch(`/api/tasks/assign/${taskId}/${empId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to assign task');
            }
    
            const data = await response.json();
            console.log('Task assigned successfully:', data.message);
            return true;
        } catch (error) {
            console.error('Error assigning task:', error.message);
            return false;
        }
    }

    async function unassignTaskToEmployee(taskId) {
        try {
            const response = await fetch(`/api/tasks/unassign/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to unassign task');
            }
    
            const data = await response.json();
            console.log('Task unassigned successfully:', data.message);
            return true;
        } catch (error) {
            console.error('Error unassigning task:', error.message);
            return false;
        }
    }

    function displayTasks_all(tasks, containerId) {
        console.log("taskyyy");
        console.log(tasks);
        const tasksContainer = document.getElementById(containerId);
        tasksContainer.innerHTML = '';
        if (tasks.length === 0) {
            const noTasksMessage = document.createElement('div');
            noTasksMessage.className = 'alert alert-info';
            noTasksMessage.textContent = 'No tasks available';
            tasksContainer.appendChild(noTasksMessage);
        } else {
            tasks.forEach(task => {
                const taskCard = createTakCard_all(task);
                tasksContainer.appendChild(taskCard);
            });
        }
    }
    function displayTasks_assigned(tasks, containerId) {
        const tasksContainer = document.getElementById(containerId);
        tasksContainer.innerHTML = '';

        if (tasks.length === 0) {
            const noTasksMessage = document.createElement('div');
            noTasksMessage.className = 'alert alert-info';
            noTasksMessage.textContent = 'No tasks available';
            tasksContainer.appendChild(noTasksMessage);
        } else {
            tasks.forEach(task => {
                const taskCard = createTakCard_assigned(task);
                tasksContainer.appendChild(taskCard);
            });
        }
    }
    function createTakCard_all(task) {
        const taskCard = document.createElement('div');
        taskCard.className = 'card mb-3';
        taskCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${task.name}</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text">Price: ${task.price}</p>
                <p class="card-text">Due Date: ${new Date(task.dueDate).toLocaleDateString()}</p>
                <button class="btn btn-success accept-btn">Accept</button>
                <button class="btn btn-danger decline-btn">Decline</button>
            </div>
        `;

        const acceptBtn = taskCard.querySelector('.accept-btn');
        acceptBtn.addEventListener('click', async () => {
            const assignedSuccessfully = await assignTaskToEmployee(task.id, empId);
            console.log(task.id+" "+empId);
            if (assignedSuccessfully) {
                taskCard.remove();
                const assignedTasks = await fetchTasksByEmployeeId(empId);
                displayTasks_assigned(assignedTasks, 'assignedTasksContainer');
            }
        });
        const declineBtn = taskCard.querySelector('.decline-btn');
        declineBtn.addEventListener('click', async () => {
        //
        });
        return taskCard;
    }
    async function fetchDetailedTask(taskId) {
        try {
            const response = await fetch(`/api/tasks/detail/${taskId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch task details');
            }
            const detailedTask = await response.json();
            return detailedTask;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    function createTakCard_assigned(task) {
        const taskCard = document.createElement('div');
        taskCard.className = 'card mb-3';
        taskCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${task.name}</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text">Price: ${task.price}</p>
                <p class="card-text">Due Date: ${new Date(task.dueDate).toLocaleDateString()}</p>
                <button class="btn btn-success view-btn">View</button>
                <button class="btn btn-danger decline-btn">Decline</button>
            </div>
        `;

        const viewBtn = taskCard.querySelector('.view-btn');
        viewBtn.addEventListener('click', async () => {
            try {
                
                const detailedTask = await fetchDetailedTask(task.id);
                displayDetailedTask(detailedTask);
            } catch (error) {
                console.error('Error fetching detailed task:', error.message);
                
            }
        });
        const declineBtn = taskCard.querySelector('.decline-btn');
        declineBtn.addEventListener('click', async () => {
            try {
                const unassignedSuccessfully = await unassignTaskToEmployee(task.id);
                
                if (unassignedSuccessfully) {
                    taskCard.remove();
                    const assignedTasks = await fetchTasksByEmployeeId(empId);
                    displayTasks_assigned(assignedTasks, 'assignedTasksContainer');
                    const allTasks = await fetchAllNotAssignedTasks();
                    displayTasks_all(allTasks, 'tasksContainer');
                } else {
                    console.error('Failed to unassign task');
                    // Handle error or display a message to the user
                }
            } catch (error) {
                console.error('Error handling decline button click:', error.message);
                // Handle error or display a message to the user
            }
        });

        return taskCard;
    }

    async function fetchAllNotAssignedTasks() {
        try {
            const response = await fetch(`/api/tasks/notassigned`, {
                method: 'GET',
            });
            console.log(response)
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
    
            const data = await response.json();
            console.log('Fetched tasks:', data);
            return data;
        } catch (error) {
            console.error('Error fetching tasks:', error.message);
            return false;
        }
    }
    async function displayDetailedTask(task) {
        // Create the modal HTML
        const modalHTML = `
            <div class="modal fade" id="taskModal" tabindex="-1" aria-labelledby="taskModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="taskModalLabel">${task.name}</h5>
                        </div>
                        <div class="modal-body">
                            <p><strong>Description:</strong> ${task.description}</p>
                            <p><strong>Price:</strong> ${task.price}</p>
                            <p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
                            <p><strong>Assigned To:</strong> ${task.assignedTo}</p>
                            <p><strong>Posted by:</strong> ${task.businessId}</p>
                            <button type="button" class="btn btn-primary do-task-btn">Do Task</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        
        // Append modal HTML to the body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    
        // Show the modal
        const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
        taskModal.show();
        document.querySelector('.do-task-btn').addEventListener('click', () => {
            redirectToTaskPage(task.id);
        });
        
    }
    
    function redirectToTaskPage(taskId) {
        window.location.href = `/do-task.html?taskId=${taskId}`;
    }
    
        
    async function fetchTasksByEmployeeId(employeeId) {
        try {
            const response = await fetch(`/api/tasks/assigned/${employeeId}`, {
                method: 'GET'
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
    
            const data = await response.json();
            console.log('Fetched tasks for employee:', data);
            return data;
        } catch (error) {
            console.error('Error fetching tasks:', error.message);
            return false;
        }
    }
    
    
    async function initializeEmployeeDashboard() {
        try {
            const empId = await fetchEmployeeIDByUserID(userData.uid);
            if (empId) {
                const allTasks = await fetchAllNotAssignedTasks();
                displayTasks_all(allTasks, 'tasksContainer');
                
                await fetchEmployeeDetails(empId);
                
                const assignedTasks = await fetchTasksByEmployeeId(empId);
                displayTasks_assigned(assignedTasks, 'assignedTasksContainer');
            } else {
                console.error('Failed to fetch employee ID');
            }
        } catch (error) {
            console.error('Error initializing employee dashboard:', error);
        }
    }

    initializeEmployeeDashboard();
});
