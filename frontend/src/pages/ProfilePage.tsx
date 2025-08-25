import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatsCard } from '../components/StatsCard';
import { ProgressCard } from '../components/ProgressCard';
import { TelegramService } from '../services/telegramService';

interface UserProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  created_at: string;
  total_workouts: number;
  total_exercises: number;
  current_streak: number;
  longest_streak: number;
  total_time: number; // in minutes
  favorite_muscle_group: string;
}

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (TelegramService.isTelegramWebApp()) {
      TelegramService.init();
    }

    // Simulate loading profile data
    setTimeout(() => {
      const mockProfile: UserProfile = {
        id: 123456789,
        username: 'fitness_user',
        first_name: 'Алексей',
        last_name: 'Петров',
        email: 'alex@example.com',
        created_at: '2024-01-15T10:00:00Z',
        total_workouts: 24,
        total_exercises: 156,
        current_streak: 7,
        longest_streak: 14,
        total_time: 1080, // 18 hours
        favorite_muscle_group: 'Грудь'
      };

      setProfile(mockProfile);
      setLoading(false);
    }, 1000);
  }, []);

  const handleBack = () => {
    window.history.pushState({}, '', '/');
  };

  const handleEditProfile = () => {
    if (TelegramService.isTelegramWebApp()) {
      TelegramService.showAlert('Функция редактирования профиля будет доступна в следующем обновлении!');
    } else {
      alert('Функция редактирования профиля будет доступна в следующем обновлении!');
    }
  };

  const handleExportData = () => {
    if (TelegramService.isTelegramWebApp()) {
      TelegramService.showAlert('Экспорт данных будет доступен в следующем обновлении!');
    } else {
      alert('Экспорт данных будет доступен в следующем обновлении!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400">Ошибка загрузки профиля</p>
          <Button onClick={handleBack} className="mt-4">
            Вернуться домой
          </Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Тренировок',
      value: profile.total_workouts,
      icon: '🏋️',
      color: 'text-indigo-400'
    },
    {
      label: 'Упражнений',
      value: profile.total_exercises,
      icon: '💪',
      color: 'text-emerald-400'
    },
    {
      label: 'Серия',
      value: profile.current_streak,
      icon: '🔥',
      color: 'text-amber-400'
    },
    {
      label: 'Время',
      value: `${Math.floor(profile.total_time / 60)}ч`,
      icon: '⏱️',
      color: 'text-rose-400'
    }
  ];

  const progressItems = [
    {
      label: 'Цель: тренировок в неделю',
      current: 3,
      target: 4,
      unit: 'тренировки',
      color: 'bg-indigo-500'
    },
    {
      label: 'Цель: время тренировки',
      current: 45,
      target: 60,
      unit: 'минут',
      color: 'bg-emerald-500'
    },
    {
      label: 'Цель: серия дней',
      current: profile.current_streak,
      target: 30,
      unit: 'дней',
      color: 'bg-amber-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4 pb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Профиль
          </h1>
          <p className="text-gray-400">
            Ваша статистика и достижения
          </p>
        </div>

        {/* Profile Info */}
        <Card className="slide-up">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-white">
                {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-gray-400 mb-4">@{profile.username}</p>
            <div className="bg-gray-800 rounded-xl p-3">
              <div className="text-sm text-gray-400 mb-1">Любимая группа мышц</div>
              <div className="text-white font-medium">{profile.favorite_muscle_group}</div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <StatsCard stats={stats} />

        {/* Progress */}
        <ProgressCard items={progressItems} />

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>🏆 Достижения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-800 rounded-xl">
                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-amber-400">🔥</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">Серия тренировок</div>
                  <div className="text-sm text-gray-400">
                    {profile.longest_streak} дней подряд
                  </div>
                </div>
                <div className="text-amber-400">✓</div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-800 rounded-xl">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-indigo-400">💪</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">Первые 10 тренировок</div>
                  <div className="text-sm text-gray-400">
                    Завершено {Math.min(profile.total_workouts, 10)}/10
                  </div>
                </div>
                <div className="text-indigo-400">
                  {profile.total_workouts >= 10 ? '✓' : '...'}
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-800 rounded-xl">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-emerald-400">⏱️</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">10 часов тренировок</div>
                  <div className="text-sm text-gray-400">
                    {Math.floor(profile.total_time / 60)}/10 часов
                  </div>
                </div>
                <div className="text-emerald-400">
                  {profile.total_time >= 600 ? '✓' : '...'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleEditProfile}
              className="w-full"
              variant="outline"
            >
              ✏️ Редактировать профиль
            </Button>
            <Button
              onClick={handleExportData}
              className="w-full"
              variant="outline"
            >
              📊 Экспорт данных
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 