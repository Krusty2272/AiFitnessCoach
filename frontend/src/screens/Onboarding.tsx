import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    fitness_goal: '',
    experience_level: '',
    weight: '',
    height: '',
    age: ''
  });

  const goals = [
    { value: 'weight_loss', label: 'Похудение', emoji: '🔥' },
    { value: 'muscle_gain', label: 'Набор массы', emoji: '💪' },
    { value: 'strength', label: 'Сила', emoji: '⚡' },
    { value: 'endurance', label: 'Выносливость', emoji: '🏃' }
  ];

  const levels = [
    { value: 'beginner', label: 'Новичок', desc: 'Только начинаю' },
    { value: 'intermediate', label: 'Средний', desc: '6-12 месяцев опыта' },
    { value: 'advanced', label: 'Продвинутый', desc: 'Больше года опыта' }
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Сохраняем данные и переходим на главный экран
      localStorage.setItem('userData', JSON.stringify(userData));
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="app-content">
      <div className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={handleBack}
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
          <h1>Настройка профиля</h1>
        </div>
        <p>Шаг {step} из 3</p>
      </div>
      
      <div className="app-body">
        {step === 1 && (
          <div style={{ width: '100%' }}>
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Ваша цель?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {goals.map(goal => (
                <button
                  key={goal.value}
                  onClick={() => setUserData({...userData, fitness_goal: goal.value})}
                  style={{
                    padding: '15px',
                    borderRadius: '12px',
                    border: userData.fitness_goal === goal.value ? '2px solid #667eea' : '1px solid rgba(255,255,255,0.1)',
                    background: userData.fitness_goal === goal.value ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255,255,255,0.05)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '16px'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{goal.emoji}</span>
                  {goal.label}
                </button>
              ))}
            </div>
            <button 
              className="start-button"
              onClick={handleNext}
              disabled={!userData.fitness_goal}
              style={{ 
                marginTop: '30px',
                opacity: userData.fitness_goal ? 1 : 0.5,
                cursor: userData.fitness_goal ? 'pointer' : 'not-allowed'
              }}
            >
              Далее
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ width: '100%' }}>
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Ваш уровень?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {levels.map(level => (
                <button
                  key={level.value}
                  onClick={() => setUserData({...userData, experience_level: level.value})}
                  style={{
                    padding: '15px',
                    borderRadius: '12px',
                    border: userData.experience_level === level.value ? '2px solid #667eea' : '1px solid rgba(255,255,255,0.1)',
                    background: userData.experience_level === level.value ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255,255,255,0.05)',
                    color: 'white',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{level.label}</div>
                  <div style={{ fontSize: '14px', color: '#8e8e93' }}>{level.desc}</div>
                </button>
              ))}
            </div>
            <button 
              className="start-button"
              onClick={handleNext}
              disabled={!userData.experience_level}
              style={{ 
                marginTop: '30px',
                opacity: userData.experience_level ? 1 : 0.5,
                cursor: userData.experience_level ? 'pointer' : 'not-allowed'
              }}
            >
              Далее
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={{ width: '100%' }}>
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>О вас</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#8e8e93' }}>Возраст</label>
                <input
                  type="number"
                  value={userData.age}
                  onChange={(e) => setUserData({...userData, age: e.target.value})}
                  placeholder="25"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#8e8e93' }}>Вес (кг)</label>
                <input
                  type="number"
                  value={userData.weight}
                  onChange={(e) => setUserData({...userData, weight: e.target.value})}
                  placeholder="75"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#8e8e93' }}>Рост (см)</label>
                <input
                  type="number"
                  value={userData.height}
                  onChange={(e) => setUserData({...userData, height: e.target.value})}
                  placeholder="180"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>
            <button 
              className="start-button"
              onClick={handleNext}
              style={{ marginTop: '30px' }}
            >
              Завершить настройку
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;