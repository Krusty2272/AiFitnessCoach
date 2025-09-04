import { useState, useEffect, useCallback } from 'react';
import cloudStorageService, { CloudData } from '../services/cloudStorageService';
import telegramService from '../services/telegramService';

interface CloudStorageState {
  isSyncing: boolean;
  lastSync: Date | null;
  syncError: string | null;
  isOnline: boolean;
}

export function useCloudStorage() {
  const [state, setState] = useState<CloudStorageState>({
    isSyncing: false,
    lastSync: null,
    syncError: null,
    isOnline: navigator.onLine
  });

  // Проверка онлайн статуса
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Загрузка времени последней синхронизации при монтировании
  useEffect(() => {
    const loadLastSync = async () => {
      const lastSync = await cloudStorageService.getLastSyncTime();
      setState(prev => ({ ...prev, lastSync }));
    };
    loadLastSync();
  }, []);

  // Автосинхронизация при восстановлении соединения
  useEffect(() => {
    if (state.isOnline && !state.isSyncing) {
      const autoSync = async () => {
        const lastSync = await cloudStorageService.getLastSyncTime();
        const now = new Date();
        
        // Синхронизируем если прошло больше 5 минут
        if (!lastSync || (now.getTime() - lastSync.getTime()) > 5 * 60 * 1000) {
          syncAll();
        }
      };
      autoSync();
    }
  }, [state.isOnline]);

  // Сохранение профиля
  const saveProfile = useCallback(async (profile: CloudData['profile']) => {
    try {
      setState(prev => ({ ...prev, isSyncing: true, syncError: null }));
      
      const success = await cloudStorageService.saveProfile(profile);
      
      if (success) {
        const lastSync = await cloudStorageService.getLastSyncTime();
        setState(prev => ({ 
          ...prev, 
          isSyncing: false, 
          lastSync,
          syncError: null 
        }));
        
        // Haptic feedback при успешном сохранении
        if (telegramService.isTelegramWebApp()) {
          telegramService.notificationOccurred('success');
        }
      } else {
        throw new Error('Failed to save profile');
      }
      
      return success;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isSyncing: false,
        syncError: error.message || 'Ошибка сохранения'
      }));
      
      if (telegramService.isTelegramWebApp()) {
        telegramService.notificationOccurred('error');
      }
      
      return false;
    }
  }, []);

  // Сохранение тренировок
  const saveWorkouts = useCallback(async (workouts: CloudData['workouts']) => {
    try {
      setState(prev => ({ ...prev, isSyncing: true, syncError: null }));
      
      const success = await cloudStorageService.saveWorkouts(workouts);
      
      if (success) {
        const lastSync = await cloudStorageService.getLastSyncTime();
        setState(prev => ({ 
          ...prev, 
          isSyncing: false, 
          lastSync,
          syncError: null 
        }));
      }
      
      return success;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isSyncing: false,
        syncError: error.message 
      }));
      return false;
    }
  }, []);

  // Сохранение прогресса
  const saveProgress = useCallback(async (progress: CloudData['progress']) => {
    try {
      setState(prev => ({ ...prev, isSyncing: true, syncError: null }));
      
      const success = await cloudStorageService.saveProgress(progress);
      
      if (success) {
        const lastSync = await cloudStorageService.getLastSyncTime();
        setState(prev => ({ 
          ...prev, 
          isSyncing: false, 
          lastSync,
          syncError: null 
        }));
      }
      
      return success;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isSyncing: false,
        syncError: error.message 
      }));
      return false;
    }
  }, []);

  // Сохранение настроек
  const savePreferences = useCallback(async (preferences: CloudData['preferences']) => {
    try {
      const success = await cloudStorageService.savePreferences(preferences);
      
      if (success && telegramService.isTelegramWebApp()) {
        telegramService.impactOccurred('light');
      }
      
      return success;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      return false;
    }
  }, []);

  // Получение данных
  const getProfile = useCallback(() => cloudStorageService.getProfile(), []);
  const getWorkouts = useCallback(() => cloudStorageService.getWorkouts(), []);
  const getProgress = useCallback(() => cloudStorageService.getProgress(), []);
  const getPreferences = useCallback(() => cloudStorageService.getPreferences(), []);

  // Полная синхронизация
  const syncAll = useCallback(async () => {
    if (state.isSyncing) return false;
    
    try {
      setState(prev => ({ ...prev, isSyncing: true, syncError: null }));
      
      // Показываем индикатор синхронизации в Telegram
      if (telegramService.isTelegramWebApp()) {
        telegramService.setMainButtonProgress(true);
      }
      
      const success = await cloudStorageService.syncAll();
      
      if (success) {
        const lastSync = await cloudStorageService.getLastSyncTime();
        setState(prev => ({ 
          ...prev, 
          isSyncing: false, 
          lastSync,
          syncError: null 
        }));
        
        if (telegramService.isTelegramWebApp()) {
          telegramService.notificationOccurred('success');
          telegramService.setMainButtonProgress(false);
        }
      } else {
        throw new Error('Sync failed');
      }
      
      return success;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isSyncing: false,
        syncError: error.message || 'Ошибка синхронизации'
      }));
      
      if (telegramService.isTelegramWebApp()) {
        telegramService.notificationOccurred('error');
        telegramService.setMainButtonProgress(false);
      }
      
      return false;
    }
  }, [state.isSyncing]);

  // Загрузка из облака
  const loadFromCloud = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isSyncing: true, syncError: null }));
      
      const success = await cloudStorageService.loadFromCloud();
      
      if (success) {
        const lastSync = await cloudStorageService.getLastSyncTime();
        setState(prev => ({ 
          ...prev, 
          isSyncing: false, 
          lastSync,
          syncError: null 
        }));
        
        if (telegramService.isTelegramWebApp()) {
          telegramService.notificationOccurred('success');
        }
      }
      
      return success;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isSyncing: false,
        syncError: error.message 
      }));
      
      if (telegramService.isTelegramWebApp()) {
        telegramService.notificationOccurred('error');
      }
      
      return false;
    }
  }, []);

  // Очистка данных
  const clearAll = useCallback(async () => {
    const confirmed = await telegramService.showConfirm(
      'Вы уверены что хотите удалить все данные? Это действие необратимо.'
    );
    
    if (!confirmed) return false;
    
    try {
      const success = await cloudStorageService.clearAll();
      
      if (success) {
        setState(prev => ({ 
          ...prev, 
          lastSync: null,
          syncError: null 
        }));
        
        if (telegramService.isTelegramWebApp()) {
          telegramService.notificationOccurred('warning');
        }
      }
      
      return success;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev,
        syncError: error.message 
      }));
      return false;
    }
  }, []);

  // Экспорт данных
  const exportData = useCallback(async () => {
    try {
      const jsonData = await cloudStorageService.exportData();
      
      // Создаем файл для скачивания
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitness-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      if (telegramService.isTelegramWebApp()) {
        telegramService.notificationOccurred('success');
      }
      
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      
      if (telegramService.isTelegramWebApp()) {
        telegramService.notificationOccurred('error');
      }
      
      return false;
    }
  }, []);

  // Импорт данных
  const importData = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const success = await cloudStorageService.importData(text);
      
      if (success) {
        if (telegramService.isTelegramWebApp()) {
          telegramService.notificationOccurred('success');
        }
        
        // Перезагружаем страницу для применения изменений
        window.location.reload();
      }
      
      return success;
    } catch (error) {
      console.error('Import failed:', error);
      
      if (telegramService.isTelegramWebApp()) {
        telegramService.notificationOccurred('error');
      }
      
      return false;
    }
  }, []);

  // Форматирование времени последней синхронизации
  const formatLastSync = useCallback(() => {
    if (!state.lastSync) return 'Никогда';
    
    const now = new Date();
    const diff = now.getTime() - state.lastSync.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч. назад`;
    
    const days = Math.floor(hours / 24);
    return `${days} дн. назад`;
  }, [state.lastSync]);

  return {
    // State
    isSyncing: state.isSyncing,
    lastSync: state.lastSync,
    syncError: state.syncError,
    isOnline: state.isOnline,
    formattedLastSync: formatLastSync(),
    
    // Save methods
    saveProfile,
    saveWorkouts,
    saveProgress,
    savePreferences,
    
    // Get methods
    getProfile,
    getWorkouts,
    getProgress,
    getPreferences,
    
    // Sync methods
    syncAll,
    loadFromCloud,
    clearAll,
    
    // Import/Export
    exportData,
    importData
  };
}