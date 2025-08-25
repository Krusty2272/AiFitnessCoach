import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/Card';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
      case 'error':
        return 'border-rose-500 bg-rose-500/10 text-rose-400';
      case 'warning':
        return 'border-amber-500 bg-amber-500/10 text-amber-400';
      case 'info':
        return 'border-indigo-500 bg-indigo-500/10 text-indigo-400';
      default:
        return 'border-gray-500 bg-gray-500/10 text-gray-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '💬';
    }
  };

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <Card className={`border-2 ${getTypeStyles()} max-w-sm`}>
        <CardContent className="p-4 flex items-center space-x-3">
          <span className="text-lg">{getIcon()}</span>
          <span className="flex-1 text-sm font-medium">{message}</span>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </CardContent>
      </Card>
    </div>
  );
}; 