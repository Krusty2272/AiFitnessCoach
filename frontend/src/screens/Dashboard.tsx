import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import workoutStorage from '../services/workoutStorage';
import hapticService from '../services/hapticService';

const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState(workoutStorage.getUserStats());

  useEffect(() => {
    const data = localStorage.getItem('userData');
    if (data) {
      setUserData(JSON.parse(data));
    }
    // Обновляем статистику
    setStats(workoutStorage.getUserStats());
  }, []);

  const getGoalEmoji = (goal: string) => {
    switch(goal) {
      case 'weight_loss': return '🔥';
      case 'muscle_gain': return '💪';
      case 'strength': return '⚡';
      case 'endurance': return '🏃';
      default: return '🎯';
    }
  };

  const getGoalText = (goal: string) => {
    switch(goal) {
      case 'weight_loss': return 'Похудение';
      case 'muscle_gain': return 'Набор массы';
      case 'strength': return 'Сила';
      case 'endurance': return 'Выносливость';
      default: return 'Фитнес';
    }
  };

  return (
    <div className="app-content animate-fadeIn">
      <div className="app-header">
        <h1>Ваш прогресс</h1>
        {userData && (
          <p className="animate-slideIn">Цель: {getGoalEmoji(userData.fitness_goal)} {getGoalText(userData.fitness_goal)}</p>
        )}
      </div>
      
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: '100px' }}>
        <div className="app-body" style={{ padding: '20px' }}>
        {/* Статистика */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '10px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>🏋️</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.totalWorkouts}</div>
            <div style={{ fontSize: '12px', color: '#8e8e93' }}>Тренировок</div>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>🔥</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.currentStreak}</div>
            <div style={{ fontSize: '12px', color: '#8e8e93' }}>Дней подряд</div>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>⏱️</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {stats.totalTime > 60 ? Math.floor(stats.totalTime / 60) : stats.totalTime}
            </div>
            <div style={{ fontSize: '12px', color: '#8e8e93' }}>
              {stats.totalTime > 60 ? 'Часов' : 'Минут'}
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '5px' }}>🔥</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.totalCalories}</div>
            <div style={{ fontSize: '12px', color: '#8e8e93' }}>Калорий</div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px' }}>Быстрые действия</h3>
          
          <button
            onClick={() => {
              hapticService.click();
              navigate('/workout/select');
            }}
            className="btn btn-primary btn-full animate-slideIn"
            data-haptic="medium"
          >
            🎯 Начать тренировку
          </button>
          
          <button
            onClick={() => {
              hapticService.light();
              navigate('/workout/generate');
            }}
            className="btn btn-secondary btn-full animate-slideIn"
            style={{ marginTop: '10px' }}
            data-haptic="light"
          >
            🤖 Сгенерировать тренировку с AI
          </button>
        </div>

        {/* Прогресс недели */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '15px'
        }}>
          <h3 style={{ marginBottom: '10px' }}>Недельная цель</h3>
          <div style={{ marginBottom: '5px', fontSize: '14px', color: '#8e8e93' }}>
            {stats.weeklyCompleted} из {stats.weeklyGoal} тренировок
          </div>
          <div style={{
            height: '8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(stats.weeklyCompleted / stats.weeklyGoal) * 100}%`,
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '4px'
            }} />
          </div>
        </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default DashboardScreen;