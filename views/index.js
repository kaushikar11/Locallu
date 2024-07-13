// index.js

// Function to parse URL parameters
function getUrlParameter(name) {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    let results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

fetch('navbar.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('navbarContainer').innerHTML = data;
            })
            .catch(error => console.error('Error fetching navbar:', error));

// Function to retrieve user ID based on email
async function getUserIdFromEmail(email) {
    try {
        const response = await fetch(`/api/users/getUserId?email=${email}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data.token);
        return data.token; // Return JWT token
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Function to display user information on the page
function displayUserInfo(email, token) {
    // const emailElement = document.getElementById('email');
    // const userIdElement = document.getElementById('userId');
    const displayNameElement = document.getElementById('displayName');
    // const photoURLElement = document.getElementById('photoURL');

    if (email) {
        // emailElement.innerText = `${email}`;
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // userIdElement.innerText = `User ID: ${payload.uid}`;
            const displayName = displayNameElement || email;
            displayNameElement.innerText = `Welcome ${payload.displayName}... choose what you want to be today...`;
            // photoURLElement.src = payload.photoURL;
        }
    } else {
        // emailElement.innerText = 'Email not found';
        // userIdElement.innerText = 'User ID not found';
        displayNameElement.innerText = 'User not found';
        // photoURLElement.src = ''; // Clear photo URL
    }
}

// async function addUserToFirestore(collection, token) {
//     const payload = JSON.parse(atob(token.split('.')[1]));
//     const { uid, email, displayName } = payload;

//     try {
//         const response = await fetch(`/api/${collection}/add`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ uid, email, displayName })
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         console.log(data);
//         return data;
//     } catch (error) {
//         console.error('Error:', error);
//         return null;
//     }
// }

async function checkEmailExists(email) {
    try {
        const response = await fetch(`/api/businesses/check-email/${email}`, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`Failed to check email (${response.status} ${response.statusText})`);
        }

        const result = await response.json();
        return result.exists;
    } catch (error) {
        console.error('Error checking email:', error.message);
        return false;
    }
}

async function checkEmailExistsinEmp(email) {
    try {
        const response = await fetch(`/api/employees/check-email/${email}`, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`Failed to check email (${response.status} ${response.statusText})`);
        }

        const result = await response.json();
        return result.exists;
    } catch (error) {
        console.error('Error checking email:', error.message);
        return false;
    }
}


document.getElementById('BusinessBtn').addEventListener('click', async () => {
    const email = getUrlParameter('email');
    const token = await getUserIdFromEmail(email);
    // Usage
    const emailExists = await checkEmailExists(email);
    if(token && emailExists){
        window.location.href = `/business_dashboard?token=${token}`;
    }

    if (token && !emailExists) {
        window.location.href = `/business_form?token=${token}`;
    }

});

document.getElementById('employeeBtn').addEventListener('click', async () => {
    const email = getUrlParameter('email');
    const token = await getUserIdFromEmail(email);
    // Usage
    const emailExists = await checkEmailExistsinEmp(email);
    if(token && emailExists){
        window.location.href = `/employee_dashboard?token=${token}`;
    }

    if (token && !emailExists) {
        window.location.href = `/employee_form?token=${token}`;
    }

});




// Main function to execute when the page loads
async function init() {
    const email = getUrlParameter('email');
    const token = await getUserIdFromEmail(email);
    displayUserInfo(email, token);
}

// Call the main function when the page loads
window.onload = init;
