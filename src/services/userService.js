import api from './api';

/**
 * Service for handling user operations
 */
const userService = {
  /**
   * Get all users
   * @returns {Promise} - The API response
   */
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
};

export default userService; 