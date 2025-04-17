import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  notifications: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const getNotifications = createAsyncThunk(
  'notifications/getNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch notifications';
      return rejectWithValue(message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationIds, { rejectWithValue }) => {
    try {
      const response = await api.put('/notifications/read', { notificationIds });
      return { notificationIds };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to mark notifications as read';
      return rejectWithValue(message);
    }
  }
);

export const deleteReadNotifications = createAsyncThunk(
  'notifications/deleteReadNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/notifications/read');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete read notifications';
      return rejectWithValue(message);
    }
  }
);

// Notification slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Get notifications
      .addCase(getNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const { notificationIds } = action.payload;
        state.notifications = state.notifications.map(notification => 
          notificationIds.includes(notification._id) 
            ? { ...notification, read: true } 
            : notification
        );
      })
      // Delete read notifications
      .addCase(deleteReadNotifications.fulfilled, (state) => {
        state.notifications = state.notifications.filter(notification => !notification.read);
      });
  },
});

export const { addNotification, clearAllNotifications } = notificationSlice.actions;
export default notificationSlice.reducer; 