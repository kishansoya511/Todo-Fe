import api from './api';

/**
 * Service for handling authentication operations
 */
const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - The API response
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Login a user
   * @param {Object} credentials - User login credentials
   * @returns {Promise} - The API response
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Logout current user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user data
   * @returns {Promise} - The API response
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Check if user is authenticated
   * @returns {Boolean} - Authentication status
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get user from local storage
   * @returns {Object|null} - User object or null
   */
  getUser: () => {
    try {
      const userString = localStorage.getItem('user');
      // Check if it's not null, undefined, or the string "undefined"
      if (userString && userString !== "undefined") {
        return JSON.parse(userString);
      }
      return null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      // Clean up invalid localStorage data
      localStorage.removeItem('user');
      return null;
    }
  },
};

export default authService; 