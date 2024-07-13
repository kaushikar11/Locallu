document.addEventListener('DOMContentLoaded', async () => {

    // Initialize Firebase if you are using Firebase
    // Replace with your Firebase configuration
    // firebase.initializeApp(firebaseConfig);

    // Function to extract taskId from URL query parameter
    function extractTaskIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('taskId');
    }

    // Function to fetch task details by taskId from backend API
    async function fetchTaskDetails(taskId) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`);
            if (!response.ok) {
                throw new Error('Task not found');
            }
            const task = await response.json();
            console.log('Fetched Task Details:', task);
            return task;
        } catch (error) {
            console.error('Error fetching task details:', error.message);
            return null;
        }
    }

    function displayTaskDetails(task) {
        const taskDetailsContainer = document.getElementById('taskDetails');
        if (!task) {
            taskDetailsContainer.innerHTML = '<p>No task details found</p>';
            return;
        }

        const taskHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${task.name}</h5>
                    <p class="card-text"><strong>Description:</strong> ${task.description}</p>
                    <p class="card-text"><strong>Price:</strong> ${task.price}</p>
                    <p class="card-text"><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
                    <p class="card-text"><strong>Assigned To:</strong> ${task.assignedTo}</p>
                    <p class="card-text"><strong>Posted by:</strong> ${task.businessId}</p>
                    <p id="yourSubmission" class="mt-3"><strong>Your Submission:
                    <button type="button" class="btn btn-primary mt-3" id="viewSolutionBtn">View Solution</button></p>
                </div>
            </div>
        `;

        taskDetailsContainer.innerHTML = taskHTML;
        document.getElementById('viewSolutionBtn').addEventListener('click', () => {
            if (task.solution) {
                displaySubmissionModal(task.solution);
            } else {
                alert('No solution submitted yet');
            }
        });
    }

    // Function to display submission details in modal
    function displaySubmissionModal(solution) {
        // Create the modal HTML
        const modalHTML = `
            <div class="modal fade" id="submissionModal" tabindex="-1" aria-labelledby="submissionModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="submissionModalLabel">Your Submission Details</h5>
                        </div>
                        <div class="modal-body">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">Submitted Code</h5>
                                    <pre><code>${solution}</code></pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Append modal HTML to the body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show the modal using Bootstrap JavaScript method
        const submissionModal = new bootstrap.Modal(document.getElementById('submissionModal'));
        submissionModal.show();
    }

    // Handling form submission
    document.getElementById('solutionForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const taskId = extractTaskIdFromURL();
        const solutionCode = document.getElementById('solutionCode').value.trim();

        if (!taskId || !solutionCode) {
            console.error('Task ID or solution code missing');
            return;
        }

        try {
            const response = await fetch(`/api/tasks/submit/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ solution: solutionCode })
            });

            if (!response.ok) {
                throw new Error('Failed to submit solution code');
            }

            console.log('Solution code submitted successfully');
            alert('Solution code submitted successfully');
            window.location.reload();

        } catch (error) {
            console.error('Error submitting solution code:', error.message);
            alert('Error submitting solution code');
        }
    });

    // Fetch and display task details when the page loads
    const taskId = extractTaskIdFromURL();
    if (taskId) {
        const task = await fetchTaskDetails(taskId);
        displayTaskDetails(task);
    } else {
        console.error('No taskId found in URL');
        displayTaskDetails(null);
    }
});
