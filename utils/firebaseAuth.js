// Firebase Auth REST API helper functions
// Used for server-side authentication operations without Admin SDK
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyCFW4OMoXV9HJykIydcycSrjqkT8gsniy0";

/**
 * Create a new user using Firebase REST API
 */
async function createUser(email, password, displayName) {
  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        email,
        password,
        displayName: displayName || '',
        returnSecureToken: true
      }
    );

    const { localId, email: userEmail, displayName: userName } = response.data;
    return {
      uid: localId,
      email: userEmail,
      displayName: userName || displayName || '',
      photoURL: ''
    };
  } catch (error) {
    console.error('[FIREBASE_AUTH] Create user error:', error.response?.status, error.response?.data || error.message);
    if (error.response?.data?.error) {
      const firebaseError = error.response.data.error;
      const errorCode = firebaseError.message?.toLowerCase() || '';
      
      if (errorCode.includes('email_exists') || errorCode.includes('email already exists')) {
        throw { code: 'auth/email-already-exists', message: 'Email already registered' };
      } else if (errorCode.includes('invalid_email')) {
        throw { code: 'auth/invalid-email', message: 'Invalid email format' };
      } else if (errorCode.includes('weak_password')) {
        throw { code: 'auth/weak-password', message: 'Password is too weak' };
      }
      // Check for 404 or project not found
      if (error.response?.status === 404 || errorCode.includes('not found') || errorCode.includes('project')) {
        throw { 
          code: 'auth/project-not-found', 
          message: 'Firebase project not found. Please verify your API key and project configuration in Firebase Console.' 
        };
      }
      throw { code: firebaseError.message || 'UNKNOWN', message: firebaseError.message || 'Unknown error' };
    }
    // Handle network errors or 404s
    if (error.response?.status === 404) {
      throw { 
        code: 'auth/api-not-found', 
        message: 'Firebase API endpoint not found. Please enable Identity Toolkit API in Google Cloud Console.' 
      };
    }
    throw error;
  }
}

/**
 * Sign in with email and password using Firebase REST API
 */
async function signInWithPassword(email, password) {
  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true
      }
    );

    const { localId, email: userEmail, displayName: userName, photoUrl } = response.data;
    return {
      uid: localId,
      email: userEmail,
      displayName: userName || '',
      photoURL: photoUrl || ''
    };
  } catch (error) {
    console.error('[FIREBASE_AUTH] Sign in error:', error.response?.status, error.response?.data || error.message);
    if (error.response?.data?.error) {
      const firebaseError = error.response.data.error;
      const errorCode = firebaseError.message?.toLowerCase() || '';
      
      if (errorCode.includes('invalid_password') || errorCode.includes('wrong password') || errorCode.includes('invalid_login_credentials')) {
        throw { code: 'auth/wrong-password', message: 'Invalid email or password' };
      } else if (errorCode.includes('user_not_found') || errorCode.includes('email not found')) {
        throw { code: 'auth/user-not-found', message: 'User not found. Please sign up first.' };
      } else if (errorCode.includes('invalid_email')) {
        throw { code: 'auth/invalid-email', message: 'Invalid email format' };
      }
      // Check error code directly
      if (firebaseError.code === 'INVALID_LOGIN_CREDENTIALS') {
        throw { code: 'auth/wrong-password', message: 'Invalid email or password' };
      }
      throw { code: firebaseError.code || firebaseError.message || 'UNKNOWN', message: firebaseError.message || 'Unknown error' };
    }
    throw error;
  }
}

/**
 * Get user by email using Firebase REST API
 */
async function getUserByEmail(email) {
  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        email: [email]
      }
    );

    if (response.data.users && response.data.users.length > 0) {
      const user = response.data.users[0];
      return {
        uid: user.localId,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoUrl || ''
      };
    }
    return null;
  } catch (error) {
    console.error('[FIREBASE_AUTH] Get user by email error:', error.response?.status, error.response?.data || error.message);
    if (error.response?.data?.error) {
      const firebaseError = error.response.data.error;
      if (firebaseError.message?.toLowerCase().includes('no user record')) {
        return null; // User not found
      }
    }
    throw error;
  }
}

/**
 * Verify ID token using Firebase REST API
 */
async function verifyIdToken(idToken) {
  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        idToken
      }
    );

    if (response.data.users && response.data.users.length > 0) {
      const user = response.data.users[0];
      return {
        uid: user.localId,
        email: user.email,
        name: user.displayName || '',
        picture: user.photoUrl || ''
      };
    }
    throw new Error('Invalid ID token');
  } catch (error) {
    console.error('[FIREBASE_AUTH] Verify ID token error:', error.response?.status, error.response?.data || error.message);
    if (error.response?.data?.error) {
      const firebaseError = error.response.data.error;
      if (firebaseError.message?.toLowerCase().includes('invalid') || 
          firebaseError.message?.toLowerCase().includes('expired')) {
        throw { code: 'auth/id-token-expired', message: 'ID token expired or invalid' };
      }
    }
    throw error;
  }
}

module.exports = {
  createUser,
  signInWithPassword,
  getUserByEmail,
  verifyIdToken
};
