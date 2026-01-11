const { db } = require('../config/firebase');
const { createUser: createUserViaAPI, getUserByEmail: getUserByEmailViaAPI, signInWithPassword, verifyIdToken } = require('../utils/firebaseAuth');
const { getDoc, doc, setDoc } = require('firebase/firestore');

// Function to create a new user in Firebase Auth
async function createUser(email, password, displayName) {
    try {
        // Create new user via REST API directly
        // The API will return an error if email already exists
        const userInfo = await createUserViaAPI(email, password, displayName);
        return userInfo;
    } catch (error) {
        console.error('[CREATE_USER] Error:', error.code || 'UNKNOWN', error.message);
        throw error;
    }
}

// Function to sign in with email and password
async function signInUser(email, password) {
    try {
        // Sign in via REST API - this will create the user in Firebase Auth if they don't exist
        const userInfo = await signInWithPassword(email, password);
        return userInfo;
    } catch (error) {
        console.error('[SIGN_IN_USER] Error:', error.code || 'UNKNOWN', error.message);
        throw error;
    }
}

// Function to retrieve user information based on email
async function getUserInfoFromEmail(email) {
    try {
        const userInfo = await getUserByEmailViaAPI(email);
        return userInfo;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

async function getBusinessIDByUserID(req, res) {
    const { uid } = req.params;

    try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
            return res.status(404).send('User not found');
        }

        const userData = userDocSnap.data();
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
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
            return res.status(404).send('User not found');
        }

        const userData = userDocSnap.data();
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
exports.createUser = createUser;
exports.signInUser = signInUser;
exports.getBusinessIDByUserID = getBusinessIDByUserID;
exports.getEmployeeIDByUserID = getEmployeeIDByUserID;
exports.verifyIdToken = verifyIdToken;
