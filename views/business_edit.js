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

    async function fetchBusinessDetails(businessId) {
        try {
            const response = await fetch(`/api/businesses/${businessId}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch business details (${response.status} ${response.statusText})`);
            }

            const businessDetails = await response.json();
            displayBusinessDetails(businessDetails);
            console.log('Fetched Business Details:', businessDetails);
        } catch (error) {
            console.error('Error fetching business details:', error.message);
        }
    }

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

    const token = extractTokenFromURL();
    const userData = decodeToken(token);
    const businessId = await fetchBusinessIDByUserID(userData.uid);

    const profilePictureUrl = await fetchProfilePicture(businessId);
    console.log(profilePictureUrl);
    const imgElement = document.querySelector('.profile-picture');
    imgElement.src = profilePictureUrl;
    const profilePictureHtml = `
        
    `;

    const businessDetailsContainer = document.getElementById('business-details');
    businessDetailsContainer.innerHTML = profilePictureHtml; // Add profile picture first

    fetchBusinessDetails(businessId);

    function displayBusinessDetails(details) {
        let html = ''; // Start a row with gutters

        // Define labels for the details
        const detailLabels = {
            businessName: "Business Name",
            companyDescription: "Business Description",
            contactInfo: "Contact Information",
            websiteURL: "Website URL",
            displayName: "Your Name",
            email: "Email",
            industry: "Industry",
            productPurpose: "Your Purpose Here",
            paymentInfo: "Payment Information"
        };

        // Display each detail item in a card
        const detailKeys = [
            "businessName",
            "companyDescription",
            "contactInfo",
            "websiteURL",
            "displayName",
            "email",
            "industry",
            "productPurpose",
            "paymentInfo"
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

        businessDetailsContainer.innerHTML += html; // Append the details
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
        await updateBusinessDetail(businessId, key, newValue);

        // Reload the business details
        fetchBusinessDetails(businessId);
        const editDetailModal = bootstrap.Modal.getInstance(document.getElementById('editDetailModal'));
        // Hide the modal after saving changes
        editDetailModal.hide();
        window.location.href = `/business_edit?token=${token}`;
    });

    async function updateBusinessDetail(businessId, key, value) {
        try {
            const response = await fetch(`/api/businesses/${businessId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key, value }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update business detail (${response.status} ${response.statusText})`);
            }

            const updatedDetails = await response.json();
            console.log('Updated Business Details:', updatedDetails);
        } catch (error) {
            console.error('Error updating business detail:', error);
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
            const response = await fetch(`/api/businesses/${businessId}/updateProfilePicture`, {
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
            window.location.href = `/business_edit?token=${token}`;
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert('Failed to update profile picture. Please try again.');
        }
    });

});

