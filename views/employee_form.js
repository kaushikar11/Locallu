document.addEventListener('DOMContentLoaded', () => {
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
            return decodedToken;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    // Function to handle form submission
    async function handleFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        // Extract token and user data
        const token = extractTokenFromURL();
        const userData = decodeToken(token);

        if (!userData) {
            console.error('Failed to extract user data from token');
            return;
        }

        // Prepare employee data including user data
        const employeeData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            paymentInfo: formData.get('paymentInfo'),
            purpose: formData.get('purpose'),
            skills: formData.getAll('skills[]'),
            location: formData.getAll('location[]'),
            contactInfo: formData.getAll('contactInfo[]'),
            githubLink: formData.get('githubLink'),
            previousJobs: formData.get('previousJobs'),
            qualifications: formData.get('qualifications'),
            aboutEmployee: formData.get('aboutEmployee'),
            // Include user data
            uid: userData.uid,
            email: userData.email,
            displayName: userData.displayName || formData.get('firstName'),
            photoURL: userData.photoURL || null
        };

        try {
            // Submit employee data
            const response = await fetch('/api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(employeeData)
            });

            if (!response.ok) {
                throw new Error('Failed to add employee');
            }

            const data = await response.json();
            console.log('Employee added successfully:', data);

            // Upload employee image if provided
            const employeeImage = formData.get('employeeImage');
            if (employeeImage && employeeImage.size > 0) {
                const imageFormData = new FormData();
                imageFormData.append('employeeImage', employeeImage);
                imageFormData.append('employeeId', data.id);

                const imageResponse = await fetch('/api/employees/uploadImage', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}` // Ensure token is included
                    },
                    body: imageFormData
                });
                console.log(imageResponse);
                if (!imageResponse.ok) {
                    throw new Error('Failed to upload employee image');
                }

                console.log('Employee image uploaded successfully');
            }

            alert('Employee added successfully!');
            form.reset();

            // Redirect to employee dashboard with token
            window.location.href = `/employee_dashboard?token=${token}`;

        } catch (error) {
            console.error('Error adding employee:', error);
            alert('Failed to add employee. Please try again.');
        }
    }

    // Add event listener for form submission
    document.getElementById('employeeForm').addEventListener('submit', handleFormSubmit);
});
