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
            const decodedToken = JSON.parse(atob(tokenParts[1])); // Assuming payload is at index 1
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

    // Function to fetch business ID by user ID
    async function fetchBusinessIDByUserID(uid) {
        try {
            const response = await fetch(`/api/users/${uid}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }

            const userDetails = await response.json();
            console.log('Fetched User Details:', userDetails);
            return userDetails.businessId;
        } catch (error) {
            console.error('Error fetching user details:', error);
            return null;
        }
    }

    function displayTasks(tasks) {
        const tasksContainer = document.getElementById('tasksContainer');
        tasksContainer.innerHTML = ''; // Clear the container first
    
        if (tasks.length === 0) {
            const noTasksMessage = document.createElement('div');
            noTasksMessage.className = 'alert alert-info';
            noTasksMessage.textContent = 'NO TASKS CREATED YET';
            tasksContainer.appendChild(noTasksMessage);
        } else {
            tasks.forEach(task => {
                const taskPill = createTaskPill(task);
                tasksContainer.appendChild(taskPill);
    
                taskPill.addEventListener('click', () => {
                    navigateToTaskDetails(token,task.id);
                });
            });
        }
    }

    // Function to create a task pill element
    function createTaskPill(task) {
        const taskPill = document.createElement('div');
        taskPill.className = 'task-pill col-md-5 m-2';
        taskPill.style.borderRadius = '10px'; // Rounded corners
        taskPill.style.backgroundColor = 'white'; // Blue background
        taskPill.style.color = 'black'; // White text color
        taskPill.style.padding = '15px'; // Padding for content
        taskPill.style.cursor = 'pointer'; // Cursor pointer for interaction
        taskPill.style.transition = 'transform 0.3s ease'; // Smooth transition

        // Add hover effect
        taskPill.addEventListener('mouseenter', () => {
            taskPill.style.transform = 'scale(1.05)';
            taskPill.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        });

        taskPill.addEventListener('mouseleave', () => {
            taskPill.style.transform = 'scale(1)';
            taskPill.style.boxShadow = 'none';
        });

        // Build HTML for task pill
        taskPill.innerHTML = `
            <h4 style="font-weight: bold;">${task.name}</h4>
            <p><strong>Description:</strong> ${task.description}</p>
            <p><strong>Price:</strong> ${task.price}</p>
            <p><strong>Date Created:</strong> ${new Date(task.dateCreated).toLocaleString()}</p>
            <p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleString()}</p>
            <p><strong>Assigned:</strong> ${task.isAssigned ? 'Yes' : 'No'}</p>
        `;

        // If task is assigned, display status percentage
        if (task.isAssigned) {
            taskPill.innerHTML += `<p><strong>Status Percentage:</strong> ${task.status[0].percentage}%</p>`;
        }

        return taskPill;
    }

   async function encodeTokenWithTaskId(token, taskID) {
    try {
        const response = await fetch(`/api/users/getUpdatedToken?token=${token}&taskID=${taskID}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data.updatedToken);
        return data.updatedToken; // Return JWT token
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}
    
// Function to navigate to task details page with updated token and task ID
async function navigateToTaskDetails(token, taskId) {
    const updatedToken = await encodeTokenWithTaskId(token, taskId);
    if (updatedToken) {
        window.location.href = `/business_task?token=${updatedToken}`;
    } else {
        console.error('Failed to update token with taskId');
    }
}


    // Function to show detailed task information in a popup/modal
    function showTaskDetails(task) {
        const modalContent = `
            <div class="modal fade" id="taskModal" tabindex="-1" role="dialog" aria-labelledby="taskModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="taskModalLabel">${task.name}</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <p><strong>Description:</strong> ${task.description}</p>
                            <p><strong>Price:</strong> ${task.price}</p>
                            <p><strong>Date Created:</strong> ${new Date(task.dateCreated).toLocaleString()}</p>
                            <p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleString()}</p>
                            <p><strong>Assigned:</strong> ${task.isAssigned ? 'Yes' : 'No'}</p>
                            ${task.isAssigned ? `<p><strong>Status Percentage:</strong> ${task.status[0].percentage}%</p>` : ''}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Append modal content to body
        document.body.insertAdjacentHTML('beforeend', modalContent);

        // Show the modal using jQuery
        $('#taskModal').modal('show');

        // Remove modal from DOM after it's closed
        $('#taskModal').on('hidden.bs.modal', function (e) {
            $(this).remove();
        });
    }

    // Function to create a new task
    async function createTask(taskData, token) {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                throw new Error(`Failed to create task (${response.status} ${response.statusText})`);
            }

            const { taskId } = await response.json();
            console.log('Created Task with ID:', taskId);

            // Fetch and display updated tasks
            fetchTasks(taskData.businessId);

            // Close the modal after task creation
            const modal = new bootstrap.Modal(document.getElementById('createTaskModal'));
            modal.hide();

            // Reset the form fields
            createTaskForm.reset();

            window.location.href = `/business_dashboard?token=${token}`;
        } catch (error) {
            console.error('Error creating task:', error.message);
        }
    }

    // Function to fetch tasks from the backend
    async function fetchTasks(businessId) {
        try {
            const response = await fetch(`/api/tasks/business/${businessId}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch tasks (${response.status} ${response.statusText})`);
            }

            const tasks = await response.json();
            console.log('Fetched Tasks:', tasks);
            displayTasks(tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error.message);
            displayTasks([]);
        }
    }

    

    if (!userData) {
        console.error('Failed to extract user data from token');
        return;
    }

    // Fetch business ID using the user ID
    const businessId = await fetchBusinessIDByUserID(userData.uid);

    if (!businessId) {
        console.error('No valid business ID found for the user');
        // Optionally handle this scenario, e.g., show an error message
        return;
    }

    document.getElementById('editProfileButton').addEventListener('click', editBusinessProfile);
    function editBusinessProfile() {
        window.location.href = `/business_edit?token=${token}`;
    }

    // Function to fetch business details
    async function fetchBusinessDetails(businessId) {
        try {
            const response = await fetch(`/api/businesses/${businessId}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch business details (${response.status} ${response.statusText})`);
            }

            const businessDetails = await response.json();
            displayBusinessDetails(businessId,businessDetails);
            console.log('Fetched Business Details:', businessDetails);

            // Display tasks only if they exist
            if (businessDetails.tasks && businessDetails.tasks.length > 0) {
                fetchTasks(businessId);
            } else {
                displayTasks([]); // No tasks created yet message
            }
        } catch (error) {
            console.error('Error fetching business details:', error.message);
        }
    }

    // Fetch and display business details
    fetchBusinessDetails(businessId);

    // Event listener for Create Task form submission
    const createTaskForm = document.getElementById('createTaskForm');

    createTaskForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const taskName = document.getElementById('taskName').value;
        const taskPrice = parseFloat(document.getElementById('taskPrice').value);
        const taskDescription = document.getElementById('taskDescription').value;
        const taskDueDate = document.getElementById('taskDueDate').value;

        // Validate form data
        if (!taskName || isNaN(taskPrice) || !taskDescription || !taskDueDate) {
            console.error('Missing required fields');
            return;
        }

        const statusPercentage = 0;
        const assignedTo = null;

        const taskData = {
            name: taskName,
            price: taskPrice,
            description: taskDescription,
            dueDate: taskDueDate,
            dateCreated: new Date().toISOString(),
            status: [{
                percentage: statusPercentage,
                updatedDatetime: null,
                comments: null
            }],
            isAssigned: false,
            assignedTo: assignedTo,
            businessId: businessId
        };

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                throw new Error(`Failed to create task (${response.status} ${response.statusText})`);
            }

            const { taskId } = await response.json();
            console.log('Created Task with ID:', taskId);

            // Navigate to task details page with updated token and taskId
            await navigateToTaskDetails(token, taskId);
            

            // Fetch and display updated tasks
            fetchTasks(businessId);

            // Close the modal after task creation
            const modal = new bootstrap.Modal(document.getElementById('createTaskModal'));
            modal.hide();

            // Reset the form fields
            createTaskForm.reset();
        } catch (error) {
            console.error('Error creating task:', error.message);
        }
    });
});

async function fetchProfilePicture(businessId) {
    try {
        const response = await fetch(`/api/businesses/profile/${businessId}`, {
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


async function displayBusinessDetails(businessId,details) {

    const pi = await fetchProfilePicture(businessId);
    console.log(pi);
    document.getElementById('profilePicture').src = pi || 'default-profile.png';
    document.getElementById('businessName').textContent = details.businessName || 'N/A';
    document.getElementById('companyDescription').textContent = details.companyDescription || 'N/A';
    // document.getElementById('productPurpose').textContent = details.productPurpose || 'N/A';
    // document.getElementById('businessEmail').textContent = details.email || 'N/A';
    // document.getElementById('industry').textContent = details.industry || 'N/A';
    // document.getElementById('contactInfo').textContent = details.contactInfo || 'N/A';
}

$(document).ready(function(){
    $("#navbarContainer").load("navbar.html");
});

