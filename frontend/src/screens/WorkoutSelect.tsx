import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkoutCard, type Workout } from '../components/WorkoutCard';
import { BottomNav } from '../components/BottomNav';

const WorkoutSelectScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [
    { value: 'all', label: 'Все' },
    { value: 'strength', label: 'Сила' },
    { value: 'cardio', label: 'Кардио' },
    { value: 'flexibility', label: 'Гибкость' },
    { value: 'hiit', label: 'HIIT' }
  ];

  const workouts: Workout[] = [
    {
      id: '1',
      name: 'Грудь и трицепс',
      emoji: '💪',
      description: 'Проработка верхней части тела',
      duration: 45,
      difficulty: 'intermediate',
      category: 'strength'
    },
    {
      id: '2',
      name: 'Утренняя йога',
      emoji: '🧘',
      description: 'Растяжка и релаксация',
      duration: 30,
      difficulty: 'beginner',
      category: 'flexibility'
    },
    {
      id: '3',
      name: 'HIIT жиросжигание',
      emoji: '🔥',
      description: 'Интенсивная интервальная тренировка',
      duration: 20,
      difficulty: 'advanced',
      category: 'hiit'
    },
    {
      id: '4',
      name: 'Бег 5км',
      emoji: '🏃',
      description: 'Кардио на выносливость',
      duration: 35,
      difficulty: 'intermediate',
      category: 'cardio'
    },
    {
      id: '5',
      name: 'Спина и бицепс',
      emoji: '💪',
      description: 'Проработка мышц спины',
      duration: 50,
      difficulty: 'intermediate',
      category: 'strength'
    },
    {
      id: '6',
      name: 'Табата',
      emoji: '⚡',
      description: '4-минутная взрывная тренировка',
      duration: 4,
      difficulty: 'advanced',
      category: 'hiit'
    }
  ];

  const filteredWorkouts = selectedCategory === 'all' 
    ? workouts 
    : workouts.filter(w => w.category === selectedCategory);

  return (
    <div className="app-content">
      <div className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8e8e93',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <h1>Выбор тренировки</h1>
        </div>
      </div>
      
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: '100px' }}>
        <div style={{ padding: '0 20px' }}>
        {/* Категории */}
        <div style={{ 
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          overflowX: 'auto',
          paddingBottom: '10px'
        }}>
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: selectedCategory === cat.value 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Список тренировок */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredWorkouts.map(workout => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onClick={() => navigate(`/workout/${workout.id}`)}
            />
          ))}
        </div>

        {/* Кнопка AI генерации */}
        <button
          onClick={() => navigate('/workout/generate')}
          style={{
            width: '100%',
            padding: '15px',
            marginTop: '20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <span>🤖</span>
          Создать тренировку с AI
        </button>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default WorkoutSelectScreen;