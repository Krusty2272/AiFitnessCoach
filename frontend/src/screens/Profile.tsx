import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { useUser } from '../hooks/useUser';
import workoutStorage from '../services/workoutStorage';
import soundService from '../services/soundService';

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, clearUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [soundSettings, setSoundSettings] = useState(soundService.getSettings());
  const [formData, setFormData] = useState({
    fitness_goal: '',
    experience_level: '',
    weight: '',
    height: '',
    age: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fitness_goal: user.fitness_goal || '',
        experience_level: user.experience_level || '',
        weight: String(user.weight || ''),
        height: String(user.height || ''),
        age: String(user.age || '')
      });
    }
  }, [user]);

  const goals = [
    { value: 'weight_loss', label: 'Похудение', emoji: '🔥' },
    { value: 'muscle_gain', label: 'Набор массы', emoji: '💪' },
    { value: 'strength', label: 'Сила', emoji: '⚡' },
    { value: 'endurance', label: 'Выносливость', emoji: '🏃' }
  ];

  const levels = [
    { value: 'beginner', label: 'Новичок' },
    { value: 'intermediate', label: 'Средний' },
    { value: 'advanced', label: 'Продвинутый' }
  ];

  const getGoalLabel = (value: string) => {
    const goal = goals.find(g => g.value === value);
    return goal ? `${goal.emoji} ${goal.label}` : '';
  };

  const getLevelLabel = (value: string) => {
    const level = levels.find(l => l.value === value);
    return level ? level.label : '';
  };

  const handleSave = () => {
    updateUser({
      ...formData,
      weight: formData.weight ? Number(formData.weight) : undefined,
      height: formData.height ? Number(formData.height) : undefined,
      age: formData.age ? Number(formData.age) : undefined
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    clearUser();
    navigate('/');
  };

  const calculateBMI = () => {
    if (user?.weight && user?.height) {
      const heightInMeters = user.height / 100;
      const bmi = user.weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Недостаточный вес', color: '#4ade80' };
    if (bmi < 25) return { text: 'Нормальный вес', color: '#22c55e' };
    if (bmi < 30) return { text: 'Избыточный вес', color: '#fbbf24' };
    return { text: 'Ожирение', color: '#f87171' };
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(Number(bmi)) : null;

  return (
    <div className="app-content">
      <div className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Профиль</h1>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#667eea',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            {isEditing ? 'Сохранить' : 'Изменить'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: '100px' }}>
        <div style={{ padding: '0 20px' }}>
        {/* Аватар и имя */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            marginBottom: '15px'
          }}>
            👤
          </div>
          <h2 style={{ marginBottom: '5px' }}>Пользователь</h2>
          <p style={{ color: '#8e8e93', fontSize: '14px' }}>
            Активный пользователь
          </p>
        </div>

        {/* Основная информация */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Основная информация</h3>
          
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#8e8e93', fontSize: '14px' }}>
                  Цель
                </label>
                <select
                  value={formData.fitness_goal}
                  onChange={(e) => setFormData({...formData, fitness_goal: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Выберите цель</option>
                  {goals.map(goal => (
                    <option key={goal.value} value={goal.value}>{goal.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#8e8e93', fontSize: '14px' }}>
                  Уровень
                </label>
                <select
                  value={formData.experience_level}
                  onChange={(e) => setFormData({...formData, experience_level: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Выберите уровень</option>
                  {levels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8e8e93' }}>Цель:</span>
                <span>{getGoalLabel(user?.fitness_goal || '')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8e8e93' }}>Уровень:</span>
                <span>{getLevelLabel(user?.experience_level || '')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Физические параметры */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Физические параметры</h3>
          
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#8e8e93', fontSize: '14px' }}>
                  Возраст
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#8e8e93', fontSize: '14px' }}>
                  Вес (кг)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#8e8e93', fontSize: '14px' }}>
                  Рост (см)
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  padding: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#8e8e93', fontSize: '12px', marginBottom: '5px' }}>Возраст</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{user?.age || '-'}</div>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  padding: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#8e8e93', fontSize: '12px', marginBottom: '5px' }}>Вес</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{user?.weight || '-'} кг</div>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  padding: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#8e8e93', fontSize: '12px', marginBottom: '5px' }}>Рост</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{user?.height || '-'} см</div>
                </div>
              </div>

              {bmi && bmiCategory && (
                <div style={{
                  background: 'rgba(102,126,234,0.1)',
                  borderRadius: '8px',
                  padding: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#8e8e93', fontSize: '12px', marginBottom: '5px' }}>Индекс массы тела (BMI)</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: bmiCategory.color }}>
                    {bmi}
                  </div>
                  <div style={{ fontSize: '14px', color: bmiCategory.color }}>
                    {bmiCategory.text}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Настройки */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Настройки</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0'
            }}>
              <span style={{ color: 'white', fontSize: '16px' }}>🔊 Звуки</span>
              <button
                onClick={() => {
                  const newState = soundService.toggleSound();
                  setSoundSettings({ ...soundSettings, soundEnabled: newState });
                  if (newState) soundService.playTestSound();
                }}
                style={{
                  width: '50px',
                  height: '28px',
                  borderRadius: '14px',
                  background: soundSettings.soundEnabled ? '#667eea' : 'rgba(255,255,255,0.2)',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  left: soundSettings.soundEnabled ? '25px' : '3px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'white',
                  transition: 'left 0.3s'
                }} />
              </button>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0'
            }}>
              <span style={{ color: 'white', fontSize: '16px' }}>📳 Вибрация</span>
              <button
                onClick={() => {
                  const newState = soundService.toggleVibration();
                  setSoundSettings({ ...soundSettings, vibrationEnabled: newState });
                }}
                style={{
                  width: '50px',
                  height: '28px',
                  borderRadius: '14px',
                  background: soundSettings.vibrationEnabled ? '#667eea' : 'rgba(255,255,255,0.2)',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  left: soundSettings.vibrationEnabled ? '25px' : '3px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'white',
                  transition: 'left 0.3s'
                }} />
              </button>
            </div>

            <button
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '10px 0'
              }}
            >
              <span>🔔 Уведомления</span>
              <span style={{ color: '#8e8e93' }}>→</span>
            </button>

            <button
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '10px 0'
              }}
            >
              <span>🌐 Язык</span>
              <span style={{ color: '#8e8e93' }}>Русский →</span>
            </button>

            <button
              onClick={() => {
                const data = workoutStorage.exportData();
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fitness_data_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '10px 0'
              }}
            >
              <span>📊 Экспорт данных</span>
              <span style={{ color: '#8e8e93' }}>→</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Вы уверены? Вся история тренировок будет удалена!')) {
                  workoutStorage.clearHistory();
                  alert('История очищена');
                  window.location.reload();
                }
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '10px 0'
              }}
            >
              <span>🗑️ Очистить историю</span>
              <span style={{ color: '#ef4444' }}>→</span>
            </button>
          </div>
        </div>

        {/* Кнопка выхода */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          Выйти из аккаунта
        </button>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default ProfileScreen;