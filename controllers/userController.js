const { admin, db } = require('../config/firebase');

// Function to retrieve user information based on email
async function getUserInfoFromEmail(email) {
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const { uid, displayName, photoURL } = userRecord;
        return { uid, email, displayName, photoURL }; // Return user information
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

async function getBusinessIDByUserID(req, res) {
    const { uid } = req.params;

    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).send('User not found');
        }

        const userData = userDoc.data();
        const businessId = userData.businessId;

        if (!businessId) {
            return res.status(404).send('Business ID not found for the user');
        }

        res.json({ businessId });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function getEmployeeIDByUserID(req, res) {
    const { uid } = req.params;

    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).send('User not found');
        }

        const userData = userDoc.data();
        const employeeId = userData.employeeId;

        if (!employeeId) {
            return res.status(404).send('Employee ID not found for the user');
        }

        res.json({ employeeId });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).send('Internal Server Error');
    }
}


exports.getUserInfoFromEmail = getUserInfoFromEmail;
exports.getBusinessIDByUserID = getBusinessIDByUserID;
exports.getEmployeeIDByUserID = getEmployeeIDByUserID;
