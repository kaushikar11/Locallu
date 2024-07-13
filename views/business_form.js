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

        // Prepare business data including user data
        const businessData = {
            businessName: formData.get('businessName'),
            paymentInfo: formData.get('paymentInfo'),
            productPurpose: formData.get('productPurpose'),
            industry: formData.getAll('industry[]'),
            location: formData.getAll('location[]'),
            contactInfo: formData.getAll('contactInfo[]'),
            websiteURL: formData.get('websiteURL'),
            companyDescription: formData.get('companyDescription'),
            // Include user data
            uid: userData.uid,
            email: userData.email,
            displayName: userData.displayName,
            photoURL: userData.photoURL
        };

        try {
            // Submit business data
            const response = await fetch('/api/businesses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(businessData)
            });

            if (!response.ok) {
                throw new Error('Failed to add business');
            }

            const data = await response.json();
            console.log('Business added successfully:', data);

            // Upload business image if provided
            const businessImage = formData.get('businessImage');
            if (businessImage && businessImage.size > 0) {
                const imageFormData = new FormData();
                imageFormData.append('businessImage', businessImage);
                imageFormData.append('businessId', data.id);

                const imageResponse = await fetch('/api/businesses/uploadImage', {
                    method: 'POST',
                    body: imageFormData
                });

                if (!imageResponse.ok) {
                    throw new Error('Failed to upload business image');
                }

                console.log('Business image uploaded successfully');
            }

            alert('Business added successfully!');
            form.reset();

            // Redirect to business dashboard with token
            window.location.href = `/business_dashboard?token=${token}`;

        } catch (error) {
            console.error('Error adding business:', error);
            alert('Failed to add business. Please try again.');
        }
    }

    // Add event listener for form submission
    document.getElementById('businessForm').addEventListener('submit', handleFormSubmit);
});
