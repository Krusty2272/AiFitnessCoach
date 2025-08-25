import { useState, useCallback } from 'react';

interface NotificationData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = useCallback((
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration?: number
  ) => {
    const id = Date.now().toString();
    const newNotification: NotificationData = {
      id,
      message,
      type,
      duration
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    if (duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration || 3000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications
  };
}; 