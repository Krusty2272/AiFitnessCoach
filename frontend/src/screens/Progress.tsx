import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { ProgressChart } from '../components/ProgressChart';
import progressService, { StatsOverview, ChartData, Milestone } from '../services/progressService';
import { useAuth } from '../hooks/useAuth';
import useSwipe from '../hooks/useSwipe';
import usePullToRefresh from '../hooks/usePullToRefresh';
import { SkeletonStatCard, SkeletonProgressChart, SkeletonCard } from '../components/Skeleton';
import { RefreshIndicator } from '../components/RefreshIndicator';

const ProgressScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [selectedChart, setSelectedChart] = useState<'workouts' | 'minutes' | 'calories'>('workouts');
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Swipe navigation
  const swipe = useSwipe({
    onSwipeLeft: () => navigate('/profile'),
    onSwipeRight: () => navigate('/dashboard'),
    threshold: 75,
    hapticFeedback: true
  });

  // Pull to refresh
  const pullToRefresh = usePullToRefresh({
    onRefresh: async () => {
      await loadData();
    },
    threshold: 80,
    hapticFeedback: true
  });

  const loadData = async () => {
    try {
      const [statsData, chartData, milestonesData] = await Promise.all([
        progressService.getStatsOverview(),
        progressService.getChartData(selectedPeriod),
        progressService.getMilestones()
      ]);

      setStats(statsData);
      setChartData(chartData);
      setMilestones(milestonesData);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  // Расчет прогресса уровня
  const getLevelProgress = () => {
    if (!stats) return 0;
    return progressService.getLevelProgress(stats.experience, stats.level);
  };

  // Форматирование streak
  const formatStreak = (days: number) => {
    if (days === 0) return 'Начните сегодня!';
    if (days === 1) return '1 день';
    if (days < 5) return `${days} дня`;
    return `${days} дней`;
  };

  // Определение emoji для milestone
  const getMilestoneEmoji = (type: string) => {
    switch (type) {
      case 'level': return '🏆';
      case 'streak': return '🔥';
      case 'weight_loss': return '⚖️';
      case 'weight_change': return '💪';
      case 'strength_gain': return '💪';
      case 'endurance': return '🏃';
      default: return '🎯';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="px-4 pt-6 pb-24">
          <h1 className="text-2xl font-bold text-white mb-6">Прогресс</h1>
          <div className="space-y-6">
            <SkeletonStatCard />
            <SkeletonProgressChart />
            <SkeletonCard />
          </div>
        </div>
        <BottomNav activeTab="progress" />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gray-900"
      {...swipe.handlers}
    >
      <RefreshIndicator progress={pullToRefresh.pullProgress} isRefreshing={pullToRefresh.isRefreshing} />
      
      <div 
        ref={scrollRef}
        className="px-4 pt-6 pb-24"
        style={{ transform: `translateY(${pullToRefresh.pullDistance}px)` }}
        {...pullToRefresh.handlers}
      >
        <h1 className="text-2xl font-bold text-white mb-6">Прогресс</h1>

        {/* Уровень и опыт */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Уровень {stats?.level || 1}</h2>
              <p className="text-sm text-gray-400">{stats?.experience || 0} XP</p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getLevelProgress()}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            До следующего уровня: {stats ? (stats.next_level_exp - stats.experience) : 0} XP
          </p>
        </div>

        {/* Основные метрики */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-400 text-sm">Всего тренировок</span>
              <span className="text-2xl">💪</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.total_workouts || 0}</p>
            <p className="text-xs text-gray-500">
              За 30 дней: {stats?.stats_30d.workouts || 0}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-400 text-sm">Streak</span>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">{stats?.current_streak || 0}</p>
            <p className="text-xs text-gray-500">{formatStreak(stats?.current_streak || 0)}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-400 text-sm">Время</span>
              <span className="text-2xl">⏱️</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.total_minutes || 0}</p>
            <p className="text-xs text-gray-500">минут тренировок</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-400 text-sm">Калории</span>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.total_calories || 0}</p>
            <p className="text-xs text-gray-500">ккал сожжено</p>
          </div>
        </div>

        {/* Графики */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Статистика</h3>
            <div className="flex gap-2">
              {(['week', 'month', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedPeriod === period
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {period === 'week' ? 'Неделя' : period === 'month' ? 'Месяц' : 'Год'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {(['workouts', 'minutes', 'calories'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedChart(type)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  selectedChart === type
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-900 text-gray-500 hover:bg-gray-800'
                }`}
              >
                {type === 'workouts' ? '💪 Тренировки' : 
                 type === 'minutes' ? '⏱️ Минуты' : 
                 '🔥 Калории'}
              </button>
            ))}
          </div>

          {chartData && (
            <ProgressChart 
              data={chartData} 
              type={selectedChart}
              height={200}
            />
          )}

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Всего</p>
              <p className="text-lg font-bold text-white">
                {chartData?.totals[selectedChart] || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Среднее</p>
              <p className="text-lg font-bold text-white">
                {chartData?.labels.length 
                  ? Math.round((chartData.totals[selectedChart] || 0) / chartData.labels.length)
                  : 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Максимум</p>
              <p className="text-lg font-bold text-white">
                {chartData?.datasets[selectedChart] 
                  ? Math.max(...chartData.datasets[selectedChart])
                  : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Любимые упражнения */}
        {stats?.favorite_exercises && stats.favorite_exercises.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Любимые упражнения</h3>
            <div className="space-y-3">
              {stats.favorite_exercises.map((exercise, index) => (
                <div key={exercise.name} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                      index === 1 ? 'bg-gray-500/20 text-gray-400' :
                      index === 2 ? 'bg-orange-600/20 text-orange-600' :
                      'bg-gray-700 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-white font-medium">{exercise.name}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{exercise.count} раз</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Достижения */}
        {milestones.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Последние достижения</h3>
            <div className="space-y-3">
              {milestones.slice(0, 5).map((milestone) => (
                <div key={milestone.id} className="flex items-center space-x-3">
                  <div className="text-2xl">{getMilestoneEmoji(milestone.type)}</div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{milestone.name}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(milestone.achieved_at).toLocaleDateString('ru')}
                    </p>
                  </div>
                  {milestone.value && (
                    <div className="text-right">
                      <p className="text-indigo-400 font-bold">{milestone.value}</p>
                      {milestone.previous_value && (
                        <p className="text-gray-500 text-xs">
                          был {milestone.previous_value}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Последние тренировки */}
        {stats?.recent_workouts && stats.recent_workouts.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">История тренировок</h3>
            <div className="space-y-3">
              {stats.recent_workouts.map((workout) => (
                <div 
                  key={workout.id}
                  className="bg-gray-900 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => navigate(`/workout/${workout.id}/details`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-white">{workout.name}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(workout.date).toLocaleDateString('ru')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      ⏱️ {workout.duration} мин
                    </span>
                    <span className="text-gray-400">
                      🔥 {workout.calories} ккал
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav activeTab="progress" />
    </div>
  );
};

export default ProgressScreen;