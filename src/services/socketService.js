import { io } from 'socket.io-client';
import config from '../utils/config';

// Socket instance (singleton)
let socket = null;

/**
 * Service for handling Socket.io operations
 */
const socketService = {
  /**
   * Initialize socket connection
   * @param {String} token - Auth token
   * @returns {Object} - Socket instance
   */
  init: (token) => {
    if (!socket) {
      socket = io(config.SOCKET_URL, {
        auth: { token },
      });

      socket.on('connect', () => {
        console.log('Socket connected');
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
      });
    }
    return socket;
  },

  /**
   * Get socket instance
   * @returns {Object|null} - Socket instance or null
   */
  getSocket: () => {
    return socket;
  },

  /**
   * Disconnect socket
   */
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  /**
   * Add event listener
   * @param {String} event - Event name
   * @param {Function} callback - Event callback
   */
  on: (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  },

  /**
   * Remove event listener
   * @param {String} event - Event name
   * @param {Function} callback - Event callback
   */
  off: (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  },
};

export default socketService; 