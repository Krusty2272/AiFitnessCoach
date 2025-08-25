import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import workoutStorage from '../services/workoutStorage';

interface WeekData {
  day: string;
  completed: boolean;
}

const ProgressScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [stats, setStats] = useState(workoutStorage.getUserStats());
  const [workoutHistory, setWorkoutHistory] = useState(workoutStorage.getWorkoutHistory());
  
  useEffect(() => {
    // Обновляем данные при загрузке
    setStats(workoutStorage.getUserStats());
    setWorkoutHistory(workoutStorage.getWorkoutHistory());
  }, []);

  // Получаем данные активности за неделю
  const getWeekData = (): WeekData[] => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const today = new Date();
    const weekData: WeekData[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const hasWorkout = workoutHistory.some(w => w.date === dateStr && w.completed);
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // Преобразуем воскресенье
      weekData.push({
        day: days[dayIndex],
        completed: hasWorkout
      });
    }
    
    return weekData;
  };

  const weekData = getWeekData();

  const getChartData = () => {
    return workoutStorage.getChartData(selectedPeriod);
  };

  const maxValue = Math.max(...getChartData());

  return (
    <div className="app-content">
      <div className="app-header">
        <h1>Ваш прогресс</h1>
        <p>Отслеживайте свои достижения</p>
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: '100px' }}>
        <div style={{ padding: '0 20px' }}>
        {/* Статистика */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="card animate-fadeIn" style={{
            background: 'var(--primary-gradient)',
            padding: 'var(--spacing-lg)',
            animation: 'fadeIn 0.6s ease-out 0.1s both'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>🔥</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.currentStreak}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Дней подряд</div>
          </div>

          <div className="card animate-fadeIn" style={{
            background: 'var(--secondary-gradient)',
            padding: 'var(--spacing-lg)',
            animation: 'fadeIn 0.6s ease-out 0.2s both'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>💪</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.totalWorkouts}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Тренировок</div>
          </div>

          <div className="card animate-fadeIn" style={{
            background: 'var(--success-gradient)',
            padding: 'var(--spacing-lg)',
            animation: 'fadeIn 0.6s ease-out 0.3s both'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>⏱️</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.totalTime > 60 ? Math.floor(stats.totalTime / 60) : stats.totalTime}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>{stats.totalTime > 60 ? 'Часов' : 'Минут'}</div>
          </div>

          <div className="card animate-fadeIn" style={{
            background: 'var(--warning-gradient)',
            padding: 'var(--spacing-lg)',
            animation: 'fadeIn 0.6s ease-out 0.4s both'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>🔥</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.totalCalories}</div>
            <div style={{ fontSize: '12px', opacity: 0.9, color: 'var(--background-primary)' }}>Калорий</div>
          </div>
        </div>

        {/* Недельная активность */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Активность за неделю</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {weekData.map((day, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  background: day.completed 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '5px'
                }}>
                  {day.completed && '✓'}
                </div>
                <span style={{ fontSize: '12px', color: '#8e8e93' }}>{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* График прогресса */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3>График тренировок</h3>
            <div style={{ display: 'flex', gap: '5px' }}>
              {(['week', 'month', 'year'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: selectedPeriod === period 
                      ? 'rgba(102,126,234,0.2)'
                      : 'transparent',
                    color: selectedPeriod === period ? '#667eea' : '#8e8e93',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {period === 'week' ? 'Неделя' : period === 'month' ? 'Месяц' : 'Год'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'space-between',
            height: '120px',
            gap: '8px'
          }}>
            {getChartData().map((value, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '100%',
                  height: `${(value / maxValue) * 100}%`,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '4px 4px 0 0',
                  minHeight: '4px',
                  transition: 'height 0.3s'
                }} />
                <span style={{ fontSize: '10px', color: '#8e8e93', marginTop: '5px' }}>
                  {selectedPeriod === 'week' && index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* История тренировок */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px' }}>Последние тренировки</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {workoutHistory.slice(0, 5).map(workout => (
              <div
                key={workout.id}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{workout.workoutName}</div>
                  <div style={{ fontSize: '12px', color: '#8e8e93' }}>
                    {new Date(workout.date).toLocaleDateString('ru-RU')} • {workout.duration} мин • {workout.calories} ккал
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/workout/${workout.id}`)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#667eea',
                    fontSize: '20px',
                    cursor: 'pointer'
                  }}
                >
                  →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Достижения */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Достижения</h3>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
            <div style={{
              minWidth: '80px',
              textAlign: 'center',
              padding: '10px',
              background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '32px' }}>🏆</div>
              <div style={{ fontSize: '10px', marginTop: '5px', color: 'black' }}>7 дней</div>
            </div>
            <div style={{
              minWidth: '80px',
              textAlign: 'center',
              padding: '10px',
              background: 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '32px' }}>🥈</div>
              <div style={{ fontSize: '10px', marginTop: '5px', color: 'black' }}>20 тренировок</div>
            </div>
            <div style={{
              minWidth: '80px',
              textAlign: 'center',
              padding: '10px',
              background: 'linear-gradient(135deg, #cd7f32 0%, #e09865 100%)',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '32px' }}>🥉</div>
              <div style={{ fontSize: '10px', marginTop: '5px', color: 'black' }}>5000 ккал</div>
            </div>
          </div>
        </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default ProgressScreen;