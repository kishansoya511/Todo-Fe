import api from './api';

/**
 * Service for handling task operations
 */
const taskService = {
  /**
   * Get all tasks with optional filters
   * @param {Object} filters - Optional filters (status, priority, assignee)
   * @returns {Promise} - The API response
   */
  getTasks: async (filters = {}) => {
    const response = await api.get('/tasks', { params: filters });
    return response.data;
  },

  /**
   * Get a single task by ID
   * @param {String} taskId - Task ID
   * @returns {Promise} - The API response
   */
  getTaskById: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Promise} - The API response
   */
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  /**
   * Update an existing task
   * @param {String} taskId - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise} - The API response
   */
  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  /**
   * Delete a task
   * @param {String} taskId - Task ID
   * @returns {Promise} - The API response
   */
  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  /**
   * Add a comment to a task
   * @param {String} taskId - Task ID
   * @param {String} commentText - Comment text
   * @returns {Promise} - The API response
   */
  addComment: async (taskId, commentText) => {
    const response = await api.post(`/tasks/${taskId}/comments`, { text: commentText });
    return response.data;
  },
};

export default taskService; 