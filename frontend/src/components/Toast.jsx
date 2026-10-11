import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} style={{ color: '#10b981' }} />;
      case 'error':
        return <AlertCircle size={18} style={{ color: '#ef4444' }} />;
      default:
        return <Info size={18} style={{ color: '#6366f1' }} />;
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      {getIcon()}
      <span style={{ fontSize: '0.875rem', flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-dim)',
          cursor: 'pointer',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
