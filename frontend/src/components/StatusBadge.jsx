import React from 'react';
import { Clock, UserCheck, PlayCircle, CheckCircle, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Submitted':
        return {
          class: 'badge-status-submitted',
          icon: <Clock size={13} />,
          label: 'Submitted',
        };
      case 'Assigned':
        return {
          class: 'badge-status-assigned',
          icon: <UserCheck size={13} />,
          label: 'Assigned',
        };
      case 'In Progress':
        return {
          class: 'badge-status-in-progress',
          icon: <PlayCircle size={13} />,
          label: 'In Progress',
        };
      case 'Resolved':
        return {
          class: 'badge-status-resolved',
          icon: <CheckCircle size={13} />,
          label: 'Resolved',
        };
      case 'Rejected':
        return {
          class: 'badge-status-rejected',
          icon: <XCircle size={13} />,
          label: 'Rejected',
        };
      default:
        return {
          class: 'badge-status-submitted',
          icon: <Clock size={13} />,
          label: status || 'Unknown',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span className={`badge ${config.class}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default StatusBadge;
