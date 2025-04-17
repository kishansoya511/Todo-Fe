import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from './redux/slices/authSlice';
import { 
  getTasks, 
  setFilters, 
  optimisticUpdateTask, 
  optimisticDeleteTask, 
  addComment,
  createTask,
  updateTask,
  deleteTask,
  optimisticAddComment
} from './redux/slices/taskSlice';
import { getUsers } from './redux/slices/userSlice';
import { getNotifications } from './redux/slices/notificationSlice';
import socketService from './services/socketService';
import { FORBIDDEN_ERROR_EVENT } from './services/api';
import Navbar from './components/Navbar';
import TaskList from './components/TaskList';
import TaskFilter from './components/TaskFilter';
import TaskForm from './components/TaskForm';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import './App.css';

// Error boundary class component to catch errors and redirect
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Redirect to dashboard or render fallback UI
      return <Navigate to="/" />;
    }

    return this.props.children; 
  }
}

// Alert component for notifications
const Alert = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    // Auto-close the alert after 5 seconds
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const bgColor = type === 'error' ? 'bg-red-100 border-red-500 text-red-700' :
                 type === 'success' ? 'bg-green-100 border-green-500 text-green-700' :
                 'bg-blue-100 border-blue-500 text-blue-700';
  
  return (
    <div className={`fixed top-20 right-4 z-50 p-4 rounded max-w-md shadow-lg border-l-4 ${bgColor}`}>
      <div className="flex justify-between items-center">
        <p className="font-medium">{message}</p>
        <button className="ml-4 text-gray-500" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

// Splash Screen component
const SplashScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Task Collab</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading application...</p>
      </div>
    </div>
  );
};

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { tasks, isLoading, error, filters } = useSelector(state => state.tasks);
  const { users } = useSelector(state => state.users);
  const { notifications } = useSelector(state => state.notifications);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskSubmitError, setTaskSubmitError] = useState(null);
  const [appInitialized, setAppInitialized] = useState(false);
  const [appError, setAppError] = useState(null);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  // Initialize app and handle errors gracefully
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if token exists, and if so, fetch current user
        const token = localStorage.getItem('token');
        if (token) {
          // Attempt to get current user data from API to restore session
          await dispatch(getCurrentUser()).unwrap();
        }
        // Set app as initialized regardless of auth status
        setAppInitialized(true);
      } catch (error) {
        console.error("Error initializing app:", error);
        setAppError(error.message || "Failed to initialize application");
        // Clear any corrupted localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setAppInitialized(true); // Still mark as initialized so the app can render
      }
    };

    initializeApp();
  }, [dispatch]);

  // Handle forbidden error events
  useEffect(() => {
    const handleForbiddenError = (event) => {
      const { message } = event.detail;
      console.error("Forbidden action:", message);
      
      // Show alert
      setAlert({
        message: message || 'You are not authorized to perform this action',
        type: 'error'
      });
      
      // Redirect to dashboard
      navigate('/');
    };
    
    window.addEventListener(FORBIDDEN_ERROR_EVENT, handleForbiddenError);
    
    return () => {
      window.removeEventListener(FORBIDDEN_ERROR_EVENT, handleForbiddenError);
    };
  }, [navigate]);

  // Global error handler
  useEffect(() => {
    const handleGlobalError = (event) => {
      console.error("Unhandled error:", event.error || event.reason);
      // Redirect to dashboard on unhandled errors
      navigate('/');
      event.preventDefault();
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleGlobalError);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleGlobalError);
    };
  }, [navigate]);

  // Fetch tasks, users, and notifications on mount and set up socket connection
  useEffect(() => {
    if (isAuthenticated && appInitialized) {
      dispatch(getTasks(filters));
      dispatch(getUsers());
      
      // Get notifications from the real API
      dispatch(getNotifications());
      
      // Initialize socket connection
      const token = localStorage.getItem('token');
      if (token) {
        const socket = socketService.init(token);
        
        // Listen for task updates from other users
        socket.on('task:update', (updatedTask) => {
          console.log('Received task update:', updatedTask);
          dispatch(optimisticUpdateTask(updatedTask));
        });
        
        // Listen for task assignments
        socket.on('task:assign', (data) => {
          console.log('Task assigned:', data);
          // If the task is assigned to the current user, update it
          if (data.assigneeId === user?._id) {
            dispatch(optimisticUpdateTask(data.task));
          }
        });
        
        // Listen for new comments
        socket.on('comment:new', (data) => {
          console.log('New comment:', data);
          dispatch(optimisticUpdateTask(data.task));
        });
        
        // Listen for task deletions
        socket.on('task:delete', (taskId) => {
          console.log('Task deleted:', taskId);
          dispatch(optimisticDeleteTask(taskId));
        });
      }
      
      // Cleanup socket connection on unmount
      return () => {
        socketService.disconnect();
      };
    }
  }, [dispatch, isAuthenticated, filters, user, appInitialized]);

  // Handle logout
  const handleLogout = () => {
    // Disconnect socket before logout
    socketService.disconnect();
    dispatch(logout());
    // Redirect to login page after logout
    navigate('/login');
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  // Task operations
  const handleEditTask = (task) => {
    setCurrentTask(task);
    setShowTaskForm(true);
    setTaskSubmitError(null);
  };

  const handleDeleteTask = (taskId) => {
    dispatch(optimisticDeleteTask(taskId));
    // Actual API call is now handled by the thunk
    dispatch(deleteTask(taskId))
      .unwrap()
      .catch(error => {
        // If the delete fails, revert the optimistic update
        dispatch(getTasks(filters));
      });
  };

  const handleCompleteTask = (taskId, newStatus) => {
    const taskToUpdate = tasks.find(task => task._id === taskId);
    if (taskToUpdate) {
      const updatedTask = { ...taskToUpdate, status: newStatus };
      dispatch(optimisticUpdateTask(updatedTask));
      // Actual API call is now handled by the thunk
      dispatch(updateTask({ taskId, taskData: { status: newStatus } }))
        .unwrap()
        .catch(error => {
          // If the update fails, revert the optimistic update
          dispatch(getTasks(filters));
        });
    }
  };

  const handleAddComment = (taskId, commentText) => {
    const comment = {
      text: commentText,
      user: user,
      createdAt: new Date().toISOString()
    };
    dispatch(optimisticAddComment({ taskId, comment }));
    // Actual API call is now handled by the thunk
    dispatch(addComment({ taskId, commentText }))
      .unwrap()
      .catch(error => {
        // If the comment fails, revert the optimistic update
        dispatch(getTasks(filters));
      });
  };

  const handleTaskSubmit = async (taskData) => {
    setTaskSubmitError(null);
    
    try {
      if (currentTask) {
        // Update existing task
        await dispatch(updateTask({ 
          taskId: currentTask._id, 
          taskData 
        })).unwrap();
      } else {
        // Create new task
        await dispatch(createTask(taskData)).unwrap();
      }
      // Close form on success
      setShowTaskForm(false);
      setCurrentTask(null);
    } catch (err) {
      setTaskSubmitError(err || 'Failed to save task. Please try again.');
    }
  };

  // If app is still initializing, show splash screen
  if (!appInitialized) {
    return <SplashScreen />;
  }

  // If there was an error initializing the app
  if (appError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
          <p className="text-gray-700 mb-4">{appError}</p>
          <p className="text-gray-600 mb-6">
            The application encountered an error during startup. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        {alert && (
          <Alert 
            message={alert.message} 
            type={alert.type} 
            onClose={() => setAlert(null)} 
          />
        )}
        
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          notifications={notifications} 
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isAuthenticated ? (
            <Routes>
              <Route path="/" element={
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                      {user && (
                        <p className="text-sm text-gray-600 mt-1">
                          Welcome to your dashboard, {user.name}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setCurrentTask(null);
                        setShowTaskForm(true);
                        setTaskSubmitError(null);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Add Task
                    </button>
                  </div>
                  
                  <TaskFilter 
                    filters={filters} 
                    setFilters={handleFilterChange}
                    users={users}
                  />
                  
                  <TaskList 
                    tasks={tasks}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onComplete={handleCompleteTask}
                    onAddComment={handleAddComment}
                    loading={isLoading}
                    error={error}
                  />
                  
                  {showTaskForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                      <div className="max-w-2xl w-full">
                        <TaskForm 
                          task={currentTask}
                          onSubmit={handleTaskSubmit}
                          onCancel={() => {
                            setShowTaskForm(false);
                            setCurrentTask(null);
                            setTaskSubmitError(null);
                          }}
                          users={users}
                          error={taskSubmitError}
                        />
                      </div>
                    </div>
                  )}
                </div>
              } />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
