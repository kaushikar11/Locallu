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
            
            displayEmployeeDetails(employeeId,employeeDetails);

            // displayEmployeeDetails(employeeDetails);
        } catch (error) {
            console.error('Error fetching employee details:', error.message);
        }
    }


    async function fetchProfilePictureforemployee(employeeId) {
        try {
            const response = await fetch(`/api/employees/profile/${employeeId}`, {
                method: 'GET'
            });
    
            if (!response.ok) {
                throw new Error(`Failed to fetch business profile picture (${response.status} ${response.statusText})`);
            }
    
    
            const profileData = await response.json();
            return profileData.profilePictureUrl;
        } catch (error) {
            console.error('Error fetching business profile picture:', error.message);
        }
    }
    



    const emppromise = fetchEmployeeIDByUserID(userData.uid);
    const empId=await emppromise;
    // const empDetails = await fetchEmployeeDetails(empId);
    console.log(empId);


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
                const taskCard = createTaskCard_all(task);
                tasksContainer.appendChild(taskCard);
            });
        }
    }
    function displayTasks_assigned(tasks, containerId) {
        const assignedTasksContainer = document.getElementById(containerId);
        assignedTasksContainer.innerHTML = '';
        if (tasks.length === 0) {
            const noTasksMessage = document.createElement('div');
            noTasksMessage.className = 'alert alert-info';
            noTasksMessage.textContent = 'No tasks assigned';
            assignedTasksContainer.appendChild(noTasksMessage);
        } else {
            tasks.forEach(task => {
                const taskCard = createTaskCard_assigned(task);
                assignedTasksContainer.appendChild(taskCard);
            });
        }
    }
    function createTaskCard_all(task) {
        const taskCard = document.createElement('div');
        taskCard.className = 'card mb-3';
        taskCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${task.name}</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text">Price: ${task.price}</p>
                <p class="card-text">Due Date: ${new Date(task.dueDate).toLocaleDateString()}</p>
                <button class="btn btn-primary accept-btn">Accept</button>
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
    function createTaskCard_assigned(task) {
        const taskCard = document.createElement('div');
        taskCard.className = 'card mb-3';
        taskCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${task.name}</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text">Price: ${task.price}</p>
                <p class="card-text">Due Date: ${new Date(task.dueDate).toLocaleDateString()}</p>
                <button class="btn btn-info view-btn">View</button>
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

    document.getElementById('editProfileButton').addEventListener('click', editEmployeeProfile);
    function editEmployeeProfile() {
        window.location.href = `/employee_edit?token=${token}`;
    }

    
async function displayEmployeeDetails(employeeId,details) {

    const pi = await fetchProfilePictureforemployee(employeeId);
    console.log(pi);
    document.getElementById('profilePicture').src = pi || 'default-profile.png';
    document.getElementById('businessName').textContent = details.firstName+" "+details.lastName || 'N/A';
    document.getElementById('companyDescription').textContent = details.aboutEmployee || 'N/A';
    // document.getElementById('productPurpose').textContent = details.productPurpose || 'N/A';
    // document.getElementById('businessEmail').textContent = details.email || 'N/A';
    // document.getElementById('industry').textContent = details.industry || 'N/A';
    // document.getElementById('contactInfo').textContent = details.contactInfo || 'N/A';
}

    initializeEmployeeDashboard();
});
