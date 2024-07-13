document.addEventListener('DOMContentLoaded', async () => {
    function extractTokenFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('token');
    }

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

    async function fetchEmployeeIDByUserID(uid) {
        try {
            const response = await fetch(`/api/users/emp/${uid}`, {
                method: 'GET'
            });

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

    async function fetchEmployeeDetails(employeeId) {
        try {
            console.log("here we go");
            console.log(employeeId);
            const response = await fetch(`/api/employees/${employeeId}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch employee details (${response.status} ${response.statusText})`);
            }

            const employeeDetails = await response.json();
            displayEmployeeDetails(employeeDetails);
            console.log('Fetched Employee Details:', employeeDetails);
        } catch (error) {
            console.error('Error fetching employee details:', error.message);
        }
    }

    async function fetchProfilePicture(employeeId) {
        try {
            const response = await fetch(`/api/employees/profile/${employeeId}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch employee profile picture (${response.status} ${response.statusText})`);
            }

            const profileData = await response.json();
            return profileData.profilePictureUrl;
        } catch (error) {
            console.error('Error fetching employee profile picture:', error.message);
        }
    }

    const token = extractTokenFromURL();
    const userData = decodeToken(token);
    const employeeId = await fetchEmployeeIDByUserID(userData.uid);

    const profilePictureUrl = await fetchProfilePicture(employeeId);
    console.log(profilePictureUrl);
    const imgElement = document.querySelector('.profile-picture');
    imgElement.src = profilePictureUrl;
    const profilePictureHtml = `
        
    `;

    const employeeDetailsContainer = document.getElementById('employee-details');
    employeeDetailsContainer.innerHTML = profilePictureHtml; // Add profile picture first

    fetchEmployeeDetails(employeeId);

    function displayEmployeeDetails(details) {
        let html = ''; // Start a row with gutters

        // Define labels for the details
        const detailLabels = {
            aboutEmployee: "About Employee",
            contactInfo: "Contact Information",
            firstName: "First Name",
            githubLink: "GitHub Link",
            lastName: "Last Name",
            location: "Location",
            paymentInfo: "Payment Information",
            previousJobs: "Previous Jobs",
            purpose: "Purpose",
            qualifications: "Qualifications",
            skills: "Skills"
        };
        
        // Display each detail item in a card
        const detailKeys = [
            "aboutEmployee",
            "contactInfo",
            "firstName",
            "githubLink",
            "lastName",
            "location",
            "paymentInfo",
            "previousJobs",
            "purpose",
            "qualifications",
            "skills"
        ];
        

        detailKeys.forEach(key => {
            if (details.hasOwnProperty(key)) {
                const value = details[key];
                const label = detailLabels[key];

                html += `<div class="col-12 col-md-6 col-lg-4">`; // Adjust column size for responsiveness
                html += `<div class="detail-card" data-key="${key}" data-value="${value}">`;
                html += `<div class="card-body">`;
                html += `<h5 class="card-title">${label}</h5>`;

                if (Array.isArray(value)) {
                    html += `<ul class="list-unstyled mb-0">`;
                    value.forEach(item => {
                        html += `<li>${item}</li>`;
                    });
                    html += `</ul>`;
                } else if (typeof value === 'string') {
                    html += `<p class="card-text m-0">${value}</p>`;
                }

                html += `</div>`;
                html += `</div>`;
                html += `</div>`;
            }
        });

        employeeDetailsContainer.innerHTML += html; // Append the details
        addCardClickListeners();
    }

    function addCardClickListeners() {
        const cards = document.querySelectorAll('.detail-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const key = card.getAttribute('data-key');
                const value = card.getAttribute('data-value');
                document.getElementById('editDetailModalLabel').innerText = `Edit ${key}`;
                document.getElementById('detailValue').value = value;
                document.getElementById('saveDetailButton').setAttribute('data-key', key);
                const editDetailModal = new bootstrap.Modal(document.getElementById('editDetailModal'));
                editDetailModal.show();
            });
        });
    }

    document.getElementById('saveDetailButton').addEventListener('click', async () => {
        const key = document.getElementById('saveDetailButton').getAttribute('data-key');
        const newValue = document.getElementById('detailValue').value;

        // Update the value in the backend (add your API endpoint here)
        await updateEmployeeDetails(employeeId, key, newValue);

        // Reload the employee details
        fetchEmployeeDetails(employeeId);
        const editDetailModal = bootstrap.Modal.getInstance(document.getElementById('editDetailModal'));
        // Hide the modal after saving changes
        editDetailModal.hide();
        window.location.href = `/employee_edit?token=${token}`;
    });

    async function updateEmployeeDetails(employeeId, key, value) {
        try {
            console.log("check 0");
            const response = await fetch(`/api/employees/${employeeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key, value }),
            });
            console.log("check 1");
            if (!response.ok) {
                throw new Error(`Failed to update employee detail (${response.status} ${response.statusText})`);
            }
            console.log("check 2");
            const updatedDetails = await response.json();
            console.log('Updated Employee Details:', updatedDetails);
        } catch (error) {
            console.error('Error updating employee detail:', error);
        }
    }

    document.getElementById('uploadProfilePictureBtn').addEventListener('click', async () => {
        console.log('Upload Profile Picture button clicked');
        const input = document.getElementById('profilePictureInput');
        if (input.files.length === 0) {
            alert('Please select an image file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('profilePicture', input.files[0]);

        try {
            const response = await fetch(`/api/employees/${employeeId}/updateProfilePicture`, {
                method: 'PUT',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload profile picture');
            }

            const data = await response.json();
            console.log('Profile picture updated successfully:', data);
            alert('Profile picture updated successfully');
            document.querySelector('.profile-picture').src = data.imageUrl; // Update the displayed profile picture
            // window.location.href = `/employee_edit?token=${token}`;
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert('Failed to update profile picture. Please try again.');
        }
    });

});

