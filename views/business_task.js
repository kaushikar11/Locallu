document.addEventListener('DOMContentLoaded', async () => {
    // Function to extract token from URL query parameter
    function extractTokenFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('token');
    }

    // Function to decode JWT token
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
    const decodedOuterToken = decodeToken(token);

    if (!decodedOuterToken) {
        console.error('Failed to extract user data from token');
        return;
    }

    // Extract the original token and taskID from the decoded token
    const { token: originalToken, taskID } = decodedOuterToken;
    console.log('Original Token:', originalToken);
    console.log('Task ID:', taskID);

    // Decode the original token to extract user data
    const decodedOriginalToken = decodeToken(originalToken);

    if (!decodedOriginalToken) {
        console.error('Failed to decode the original token');
        return;
    }

    // Extract uid from the decoded original token
    const { uid } = decodedOriginalToken;
    console.log('User ID (uid):', uid);

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

    // Function to fetch business details
    async function fetchBusinessDetails(businessId, token, taskID) {
        try {
            const response = await fetch(`/api/businesses/${businessId}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch business details (${response.status} ${response.statusText})`);
            }

            const businessDetails = await response.json();
            console.log('Fetched Business Details:', businessDetails);

            // Check if tasks exist and find the task with matching taskID
            if (businessDetails.tasks && businessDetails.tasks.length > 0) {
                const isTaskIDExists = businessDetails.tasks.includes(taskID);
                console.log('Task ID Exists:', isTaskIDExists);
                if (isTaskIDExists) {
                    fetchTask(taskID, businessDetails, token);
                } else {
                    window.location.href = `/business_dashboard?token=${token}`;
                }
            } else {
                displayTasks([]); // No tasks created yet message
            }
        } catch (error) {
            console.error('Error fetching business details:', error.message);
        }
    }

    // Function to fetch task and display details
    async function fetchTask(taskID, businessDetails, token) {
        try {
            const response = await fetch(`/api/tasks/${taskID}`);
            if (!response.ok) {
                throw new Error('Failed to fetch task');
            }

            const task = await response.json();
            console.log('Fetched Task:', task);
            displayTask(task, businessDetails, token);
        } catch (error) {
            console.error('Error fetching task:', error);
        }
    }

    // Function to display a single task with parsed dates and an update form
    function displayTask(task, businessDetails, token) {
        const tasksContainer = document.getElementById('tasksContainer');
        tasksContainer.innerHTML = ''; // Clear the container first

        const taskCard = document.createElement('div');
        taskCard.className = 'card mb-3';
        taskCard.style.padding = '20px';

        // Task Name
        const taskName = document.createElement('h2');
        taskName.style.fontSize = '2rem';
        taskName.style.fontWeight = 'bold';
        taskName.textContent = task.name;
        taskCard.appendChild(taskName);

        // Task Description
        const taskDescription = document.createElement('p');
        taskDescription.textContent = `Description: ${task.description}`;
        taskCard.appendChild(taskDescription);

        // Task Price
        const taskPrice = document.createElement('p');
        taskPrice.style.color = 'green';
        taskPrice.textContent = `Price: $${task.price}`;
        taskCard.appendChild(taskPrice);

        // Task Date Created
        if (task.dateCreated) {
            const formattedDateCreated = new Date(task.dateCreated).toLocaleString();
            const dateCreatedElem = document.createElement('p');
            dateCreatedElem.textContent = `Date Created: ${formattedDateCreated}`;
            taskCard.appendChild(dateCreatedElem);
        } else {
            const dateCreatedElem = document.createElement('p');
            dateCreatedElem.textContent = 'Date Created: Not available';
            taskCard.appendChild(dateCreatedElem);
        }

        // Task Due Date
        if (task.dueDate) {
            const formattedDueDate = new Date(task.dueDate).toLocaleString();
            const dueDateElem = document.createElement('p');
            dueDateElem.textContent = `Due Date: ${formattedDueDate}`;
            taskCard.appendChild(dueDateElem);
        } else {
            const dueDateElem = document.createElement('p');
            dueDateElem.textContent = 'Due Date: Not available';
            taskCard.appendChild(dueDateElem);
        }

        // Assigned To
        const assignedTo = document.createElement('p');
        assignedTo.textContent = `Assigned To: ${task.assignedTo ? task.assignedTo : 'Not yet assigned'}`;
        taskCard.appendChild(assignedTo);

        // Task Issued By
        const issuedBy = document.createElement('p');
        issuedBy.textContent = `Task Issued By: ${businessDetails.businessName}`;
        taskCard.appendChild(issuedBy);

        // Business Contact Info
        const contactInfo = document.createElement('p');
        contactInfo.textContent = `Contact Info: ${businessDetails.contactInfo}`;
        taskCard.appendChild(contactInfo);

        // Task Status
        const status = document.createElement('div');
        status.className = 'status';
        const statusPercentage = document.createElement('p');
        statusPercentage.textContent = `Status: ${task.status[0].percentage}%`;
        status.appendChild(statusPercentage);
        const statusComments = document.createElement('p');
        statusComments.textContent = `Comments: ${task.status[0].comments ? task.status[0].comments : 'No comments'}`;
        status.appendChild(statusComments);
        const statusUpdatedDatetime = document.createElement('p');
        statusUpdatedDatetime.textContent = `Updated: ${task.status[0].updatedDatetime ? new Date(task.status[0].updatedDatetime).toLocaleString() : 'No updates'}`;
        status.appendChild(statusUpdatedDatetime);
        taskCard.appendChild(status);

        // Update Task Button (Modal Trigger)
        const updateButton = document.createElement('button');
        updateButton.textContent = 'Update Task';
        updateButton.className = 'btn btn-primary mt-3 mr-2';
        updateButton.setAttribute('data-toggle', 'modal');
        updateButton.setAttribute('data-target', '#updateTaskModal');
        updateButton.addEventListener('click', () => {
            populateUpdateForm(task);
        });
        taskCard.appendChild(updateButton);

        // Delete Task Button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete Task';
        deleteButton.className = 'btn btn-danger mt-3';
        deleteButton.addEventListener('click', async () => {
            const confirmed = confirm('Are you sure you want to delete this task?');
            if (confirmed) {
                try {
                    const response = await fetch(`/api/tasks/delete/${task.id}`, {
                        method: 'DELETE'
                        // Add headers if needed
                    });

                    if (!response.ok) {
                        throw new Error('Failed to delete task');
                    }

                    window.location.href = `/business_dashboard?token=${token}`;

                    // Optionally handle success (e.g., remove task from UI, show message)
                    console.log('Task deleted successfully');
                    alert('Task deleted successfully');
                } catch (error) {
                    console.error('Error deleting task:', error);
                    alert('Failed to delete task');
                }
            }
        });
        taskCard.appendChild(deleteButton);

        tasksContainer.appendChild(taskCard);
    }

    // Function to populate update form with task details
    function populateUpdateForm(task) {
        document.getElementById('updateDescription').value = task.description || '';
        document.getElementById('updatePrice').value = task.price || '';
        document.getElementById('updateDueDate').value = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
    }

    // Function to update task details
    document.getElementById('updateTaskForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const updatedTask = {
            description: formData.get('description'),
            price: formData.get('price'),
            dueDate: formData.get('dueDate')
        };

        try {
            const response = await fetch(`/api/tasks/update/${taskID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTask)
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            const businessDetails = fetchBusinessDetails(businessId,originalToken,taskID);

            // Refresh the task details after update
            fetchTask(taskID, businessDetails, token);
            $('#updateTaskModal').modal('hide'); // Hide the modal after update
            alert('Task updated successfully');
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task');
        }
    });

    // Fetch business ID using the user ID
    const businessId = await fetchBusinessIDByUserID(uid);

    if (!businessId) {
        console.error('No valid business ID found for the user');
        // Optionally handle this scenario, e.g., show an error message
        return;
    }

    console.log('Business ID:', businessId);

    // Fetch and display business details
    fetchBusinessDetails(businessId, originalToken, taskID);
});
