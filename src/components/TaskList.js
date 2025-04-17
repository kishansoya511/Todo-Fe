import React from 'react';
import Todo from './Todo';

/**
 * TaskList component for displaying a list of tasks
 */
const TaskList = ({ tasks, onEdit, onDelete, onComplete, onAddComment, loading, error }) => {
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  // No tasks state
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500">No tasks found. Create a new task to get started!</p>
      </div>
    );
  }

  // Render task list
  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <Todo
          key={task._id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onComplete={onComplete}
          onAddComment={onAddComment}
        />
      ))}
    </div>
  );
};

export default TaskList; 