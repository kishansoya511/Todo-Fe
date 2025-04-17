import axios from 'axios';
import config from '../utils/config';

// Create a custom event to handle forbidden errors
export const FORBIDDEN_ERROR_EVENT = 'api:forbidden';

/**
 * Emit a forbidden error event with the error message
 * @param {string} message - Error message
 */
export const emitForbiddenError = (message) => {
  const event = new CustomEvent(FORBIDDEN_ERROR_EVENT, { 
    detail: { message }
  });
  window.dispatchEvent(event);
};

/**
 * Axios instance with predefined configuration
 */
const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors (unauthorized) by redirecting to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle 403 errors (forbidden) by emitting a custom event
    if (error.response && error.response.status === 403) {
      const message = error.response.data?.message || 'You are not authorized to perform this action';
      emitForbiddenError(message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 