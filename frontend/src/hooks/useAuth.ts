import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import telegramService from '../services/telegramService';

interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_premium: boolean;
  level: number;
  experience: number;
  streak_days: number;
  total_workouts: number;
  total_minutes: number;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  // Авторизация
  const login = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const user = await authService.loginWithTelegram();
      
      if (user) {
        setAuthState({
          user,
          loading: false,
          error: null
        });
        return true;
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: 'Не удалось авторизоваться'
        });
        return false;
      }
    } catch (error: any) {
      setAuthState({
        user: null,
        loading: false,
        error: error.message || 'Ошибка авторизации'
      });
      return false;
    }
  }, []);

  // Выход
  const logout = useCallback(() => {
    authService.logout();
    setAuthState({
      user: null,
      loading: false,
      error: null
    });
  }, []);

  // Обновление профиля
  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!authState.user) return false;
    
    try {
      const updatedUser = await authService.updateProfile(data);
      
      if (updatedUser) {
        setAuthState(prev => ({
          ...prev,
          user: updatedUser
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return false;
    }
  }, [authState.user]);

  // Добавление опыта
  const addExperience = useCallback(async (exp: number) => {
    if (!authState.user) return;
    
    const newExp = authState.user.experience + exp;
    const levelData = authService.calculateLevelProgress(newExp);
    
    // Проверяем повышение уровня
    if (levelData.level > authState.user.level) {
      // Уведомление о новом уровне
      telegramService.notificationOccurred('success');
      telegramService.impactOccurred('heavy');
      
      // Можно показать попап с поздравлением
      if (telegramService.isTelegramWebApp()) {
        telegramService.showAlert(`🎉 Поздравляем! Вы достигли ${levelData.level} уровня!`);
      }
    }
    
    // Обновляем профиль
    await updateProfile({
      experience: newExp,
      level: levelData.level
    });
  }, [authState.user, updateProfile]);

  // Обновление статистики после тренировки
  const completeWorkout = useCallback(async (duration: number, calories: number) => {
    if (!authState.user) return;
    
    const updates = {
      total_workouts: authState.user.total_workouts + 1,
      total_minutes: authState.user.total_minutes + duration,
      calories_burned: (authState.user as any).calories_burned + calories,
      last_workout_date: new Date().toISOString()
    };
    
    // Проверяем streak
    const lastWorkout = authState.user.last_workout_date;
    if (lastWorkout) {
      const lastDate = new Date(lastWorkout);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Продолжаем streak
        (updates as any).streak_days = authState.user.streak_days + 1;
      } else if (diffDays > 1) {
        // Streak прерван
        (updates as any).streak_days = 1;
      }
    } else {
      // Первая тренировка
      (updates as any).streak_days = 1;
    }
    
    await updateProfile(updates);
    
    // Добавляем опыт за тренировку
    const expGained = Math.floor(duration / 10) * 10; // 10 опыта за каждые 10 минут
    await addExperience(expGained);
  }, [authState.user, updateProfile, addExperience]);

  // Автоматическая авторизация при загрузке
  useEffect(() => {
    const autoAuth = async () => {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      try {
        const user = await authService.autoLogin();
        
        setAuthState({
          user,
          loading: false,
          error: user ? null : 'Требуется авторизация'
        });
      } catch (error: any) {
        setAuthState({
          user: null,
          loading: false,
          error: error.message || 'Ошибка инициализации'
        });
      }
    };
    
    autoAuth();
  }, []);

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    login,
    logout,
    updateProfile,
    addExperience,
    completeWorkout
  };
}