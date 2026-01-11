import axios from 'axios';

// In the browser, `process` is not defined by default. Safely read env if available.
const API_BASE_URL =
  (typeof process !== 'undefined' &&
    process.env &&
    process.env.REACT_APP_API_URL) ||
  '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await apiService.refreshToken();
        if (response.token) {
          // Update the authorization header with new token
          originalRequest.headers.Authorization = `Bearer ${response.token}`;
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/index' && window.location.pathname !== '/') {
          window.location.href = '/index';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden (token expired/invalid)
    if (error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/index' && window.location.pathname !== '/') {
        window.location.href = '/index';
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Auth
  getUserId: async (email) => {
    const response = await api.get('/users/getUserId', { params: { email } });
    return response.data;
  },

  signup: async (email, password, displayName) => {
    const response = await api.post('/users/signup', { email, password, displayName });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },

  verifyToken: async (idToken) => {
    const response = await api.post('/users/verify-token', { idToken });
    return response.data;
  },

  // Legacy method - kept for backwards compatibility
  googleAuth: async (idToken, displayName, email, photoURL) => {
    const response = await api.post('/users/google-auth', { idToken, displayName, email, photoURL });
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/users/refresh-token');
    return response.data;
  },

  // User
  getBusinessIdByUserId: async (uid) => {
    const response = await api.get(`/users/${uid}`);
    return response.data;
  },

  getEmployeeIdByUserId: async (uid) => {
    const response = await api.get(`/users/emp/${uid}`);
    return response.data;
  },

  // Business
  createBusiness: async (data) => {
    const response = await api.post('/businesses', data);
    return response.data;
  },

  getBusinessDetails: async (businessId) => {
    const response = await api.get(`/businesses/${businessId}`);
    return response.data;
  },

  updateBusinessDetail: async (businessId, key, value) => {
    const response = await api.put(`/businesses/${businessId}`, { key, value });
    return response.data;
  },

  uploadBusinessImage: async (businessId, file) => {
    const formData = new FormData();
    formData.append('businessImage', file);
    formData.append('businessId', businessId);
    const response = await api.post('/businesses/uploadImage', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateBusinessProfilePicture: async (businessId, file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    const response = await api.put(`/businesses/${businessId}/updateProfilePicture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getBusinessProfilePicture: async (businessId) => {
    const response = await api.get(`/businesses/profile/${businessId}`);
    return response.data;
  },

  checkBusinessEmail: async (email) => {
    const response = await api.get(`/businesses/check-email/${email}`);
    return response.data;
  },

  // Employee
  createEmployee: async (data) => {
    const response = await api.post('/employees', data);
    return response.data;
  },

  getEmployeeDetails: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}`);
    return response.data;
  },

  updateEmployeeDetails: async (employeeId, key, value) => {
    const response = await api.put(`/employees/${employeeId}`, { key, value });
    return response.data;
  },

  uploadEmployeeImage: async (employeeId, file) => {
    const formData = new FormData();
    formData.append('employeeImage', file);
    formData.append('employeeId', employeeId);
    const response = await api.post('/employees/uploadImage', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateEmployeeProfilePicture: async (employeeId, file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    const response = await api.put(`/employees/${employeeId}/updateProfilePicture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getEmployeeProfilePicture: async (employeeId) => {
    const response = await api.get(`/employees/profile/${employeeId}`);
    return response.data;
  },

  checkEmployeeEmail: async (email) => {
    const response = await api.get(`/employees/check-email/${email}`);
    return response.data;
  },

  // Tasks
  createTask: async (data) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  getTask: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  getTasksByBusiness: async (businessId) => {
    const response = await api.get(`/tasks/business/${businessId}`);
    return response.data;
  },

  getTasksByEmployee: async (employeeId) => {
    const response = await api.get(`/tasks/employee/${employeeId}`);
    return response.data;
  },

  getUnassignedTasks: async () => {
    const response = await api.get('/tasks/notassigned');
    return response.data;
  },

  getAllTasks: async (page = 1, limit = 6, lastDocId = null) => {
    const params = { page, limit };
    if (lastDocId) params.lastDocId = lastDocId;
    const response = await api.get('/tasks/all', { params });
    return response.data;
  },

  getAssignedTasks: async (employeeId) => {
    const response = await api.get(`/tasks/assigned/${employeeId}`);
    return response.data;
  },

  assignTask: async (taskId, employeeId) => {
    const response = await api.put(`/tasks/assign/${taskId}/${employeeId}`);
    return response.data;
  },

  unassignTask: async (taskId) => {
    const response = await api.put(`/tasks/unassign/${taskId}`);
    return response.data;
  },

  submitTaskSolution: async (taskId, solution) => {
    const response = await api.put(`/tasks/submit/${taskId}`, { solution });
    return response.data;
  },

  reviewTask: async (taskId, action, reviewComments) => {
    const response = await api.put(`/tasks/review/${taskId}`, { action, reviewComments });
    return response.data;
  },

  updateTaskStatus: async (taskId, newStatus, comments) => {
    const response = await api.put(`/tasks/status/${taskId}`, { newStatus, comments });
    return response.data;
  },

  updateTask: async (taskId, data) => {
    const response = await api.put(`/tasks/update/${taskId}`, data);
    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/delete/${taskId}`);
    return response.data;
  },

  // Home
  sendContactEmail: async (data) => {
    const response = await api.post('/home/send-email', data);
    return response.data;
  },
};

export default api;

