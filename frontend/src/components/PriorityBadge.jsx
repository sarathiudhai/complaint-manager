import React from 'react';

const PriorityBadge = ({ priority }) => {
  const getPriorityClass = () => {
    switch (priority) {
      case 'Low':
        return 'badge-priority-low';
      case 'Medium':
        return 'badge-priority-medium';
      case 'High':
        return 'badge-priority-high';
      case 'Urgent':
        return 'badge-priority-urgent';
      default:
        return 'badge-priority-medium';
    }
  };

  return (
    <span className={`badge ${getPriorityClass()}`}>
      {priority}
    </span>
  );
};

export default PriorityBadge;
