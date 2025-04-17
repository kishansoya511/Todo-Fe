import React, { useState } from 'react';

/**
 * Todo component to display a single task
 */
const Todo = ({ task, onEdit, onDelete, onComplete, onAddComment }) => {
  const [commentText, setCommentText] = useState('');

  // Function to render task priority with appropriate color
  const renderPriority = (priority) => {
    const priorityColors = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800',
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[priority] || 'bg-gray-100'}`}>
        {priority}
      </span>
    );
  };

  // Handle comment submission
  const handleAddComment = () => {
    if (commentText.trim()) {
      onAddComment(task._id, commentText);
      setCommentText('');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h3>
          <div className="flex gap-2 mt-1 items-center">
            {renderPriority(task.priority)}
            {task.dueDate && (
              <span className="text-xs text-gray-500">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onComplete(task._id, task.status === 'completed' ? 'pending' : 'completed')}
            className={`p-1 rounded-full ${task.status === 'completed' ? 'bg-gray-200 text-gray-700' : 'bg-green-200 text-green-700'}`}
            title={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
          >
            {task.status === 'completed' ? '↩' : '✓'}
          </button>
          <button 
            onClick={() => onEdit(task)}
            className="p-1 rounded-full bg-blue-200 text-blue-700"
            title="Edit task"
          >
            ✎
          </button>
          <button 
            onClick={() => onDelete(task._id)}
            className="p-1 rounded-full bg-red-200 text-red-700"
            title="Delete task"
          >
            ×
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 mt-2 mb-3">{task.description}</p>
      )}
      
      {/* Assignees */}
      {task.assignees && task.assignees.length > 0 && (
        <div className="mt-2 mb-2">
          <div className="flex items-center">
            <span className="text-sm text-gray-700 font-medium mr-2">Assigned to:</span>
            <div className="flex flex-wrap gap-1">
              {task.assignees.map(assignee => (
                <span key={assignee._id} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {assignee.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Comments section */}
      {task.comments && task.comments.length > 0 && (
        <div className="mt-3 border-t pt-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Comments</h4>
          <div className="space-y-2">
            {task.comments.map((comment, index) => (
              <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                <div className="font-medium text-xs text-gray-500">
                  {comment.user?.name || 'Unknown'} • {new Date(comment.createdAt).toLocaleString()}
                </div>
                <p>{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add comment input */}
      <div className="mt-3 pt-2 border-t">
        <div className="flex">
          <input 
            type="text" 
            placeholder="Add a comment..." 
            className="flex-1 border rounded-l-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && commentText.trim()) {
                handleAddComment();
              }
            }}
          />
          <button 
            className="bg-blue-500 text-white px-3 py-1 rounded-r-lg text-sm"
            onClick={handleAddComment}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Todo; 