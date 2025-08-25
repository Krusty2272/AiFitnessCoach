import React from 'react';

export interface Workout {
  id: string;
  name: string;
  emoji: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

interface WorkoutCardProps {
  workout: Workout;
  onClick: () => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onClick }) => {
  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: '#4ade80',
      intermediate: '#fbbf24',
      advanced: '#f87171'
    };
    return colors[difficulty as keyof typeof colors] || '#8e8e93';
  };

  const getDifficultyText = (difficulty: string) => {
    const texts = {
      beginner: 'Легкий',
      intermediate: 'Средний',
      advanced: 'Сложный'
    };
    return texts[difficulty as keyof typeof texts] || '';
  };

  const cardStyle: React.CSSProperties = {
    padding: '15px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s'
  };

  return (
    <button
      onClick={onClick}
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>{workout.emoji}</span>
            <h3 style={{ color: 'white', fontSize: '16px', margin: 0 }}>{workout.name}</h3>
          </div>
          <p style={{ color: '#8e8e93', fontSize: '14px', margin: 0, marginBottom: '10px' }}>
            {workout.description}
          </p>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ color: '#8e8e93', fontSize: '13px' }}>
              ⏱️ {workout.duration} мин
            </span>
            <span style={{ 
              color: getDifficultyColor(workout.difficulty), 
              fontSize: '13px',
              fontWeight: 'bold'
            }}>
              {getDifficultyText(workout.difficulty)}
            </span>
          </div>
        </div>
        <span style={{ color: '#667eea', fontSize: '20px' }}>→</span>
      </div>
    </button>
  );
};