import React from 'react';
import config from '../utils/config';

/**
 * TaskFilter component for filtering tasks
 */
const TaskFilter = ({ filters, setFilters, users }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleReset = () => {
    setFilters({
      status: '',
      priority: '',
      assignee: '',
    });
  };

  // Add handlers for quick status filtering
  const handleShowCompleted = () => {
    setFilters({
      ...filters,
      status: 'completed',
    });
  };

  const handleShowPending = () => {
    setFilters({
      ...filters,
      status: 'pending',
    });
  };

  const handleShowAll = () => {
    setFilters({
      ...filters,
      status: '',
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      {/* Status filter buttons - always visible for quick access */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={handleShowAll}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filters.status === '' 
                ? 'bg-gray-700 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All Tasks
          </button>
          <button
            onClick={handleShowPending}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filters.status === 'pending' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            Pending Tasks
          </button>
          <button
            onClick={handleShowCompleted}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filters.status === 'completed' 
                ? 'bg-green-600 text-white' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            Completed Tasks
          </button>
        </div>
      </div>

      {/* Advanced filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0 md:space-x-4">
        {/* Status dropdown filter */}
        <div className="flex-1">
          <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="status">
            Task Status
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="status"
            name="status"
            value={filters.status}
            onChange={handleChange}
          >
            <option value="">All Tasks</option>
            <option value="pending">Pending Tasks</option>
            <option value="completed">Completed Tasks</option>
          </select>
        </div>

        {/* Priority filter */}
        <div className="flex-1">
          <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="priority">
            Priority
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="priority"
            name="priority"
            value={filters.priority}
            onChange={handleChange}
          >
            <option value="">All</option>
            {config.PRIORITIES.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>

        {/* Assignee filter */}
        {users && users.length > 0 && (
          <div className="flex-1">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="assignee">
              Assignee
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="assignee"
              name="assignee"
              value={filters.assignee}
              onChange={handleChange}
            >
              <option value="">All</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Reset button */}
        <div className="flex-none self-end pb-0.5">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskFilter;