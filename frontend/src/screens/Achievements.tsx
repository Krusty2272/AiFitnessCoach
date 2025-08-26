import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import achievementService, { Achievement } from '../services/achievementService';
import particleService from '../services/particleService';
import hapticService from '../services/hapticService';

const AchievementsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Achievement['category'] | 'all'>('all');
  const [progress, setProgress] = useState({
    total: 0,
    unlocked: 0,
    percentage: 0,
    points: 0
  });

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = () => {
    const allAchievements = achievementService.getAchievements();
    setAchievements(allAchievements);
    setProgress(achievementService.getProgress());
  };

  const categories = [
    { id: 'all' as const, label: 'Все', icon: '🏅' },
    { id: 'workout' as const, label: 'Тренировки', icon: '💪' },
    { id: 'streak' as const, label: 'Серии', icon: '🔥' },
    { id: 'social' as const, label: 'Социальные', icon: '👥' },
    { id: 'special' as const, label: 'Особые', icon: '⭐' }
  ];

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary': return 'linear-gradient(135deg, #ffd700, #ffed4e)';
      case 'epic': return 'linear-gradient(135deg, #9333ea, #c084fc)';
      case 'rare': return 'linear-gradient(135deg, #3b82f6, #60a5fa)';
      default: return 'linear-gradient(135deg, #6b7280, #9ca3af)';
    }
  };

  const handleAchievementClick = (achievement: Achievement) => {
    hapticService.light();
    if (achievement.unlocked) {
      particleService.emojiExplosion(
        achievement.icon,
        window.innerWidth / 2,
        window.innerHeight / 2,
        8
      );
    }
  };

  return (
    <div className="app-content">
      <div className="app-header">
        <h1>Достижения</h1>
        <p>Ваш путь к совершенству</p>
      </div>

      {/* Общий прогресс */}
      <div style={{
        background: 'var(--primary-gradient)',
        padding: '20px',
        margin: '10px',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div>
            <h3 style={{ marginBottom: '5px' }}>Общий прогресс</h3>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>
              {progress.unlocked} из {progress.total} достижений
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
              {progress.points}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>очков</div>
          </div>
        </div>
        
        <div style={{
          height: '12px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress.percentage}%`,
            height: '100%',
            background: 'white',
            borderRadius: '6px',
            transition: 'width 1s ease-out',
            boxShadow: '0 0 10px rgba(255,255,255,0.5)'
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '5px',
          fontSize: '12px',
          opacity: 0.9
        }}>
          <span>0%</span>
          <span>{progress.percentage}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Категории */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '10px',
        overflowX: 'auto'
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '8px 16px',
              background: selectedCategory === cat.id
                ? 'var(--primary-gradient)'
                : 'var(--background-card)',
              border: 'none',
              borderRadius: '20px',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Список достижений */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: '100px' }}>
        <div style={{ padding: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {filteredAchievements.map(achievement => (
              <div
                key={achievement.id}
                onClick={() => handleAchievementClick(achievement)}
                style={{
                  background: achievement.unlocked
                    ? getRarityColor(achievement.rarity)
                    : 'var(--background-card)',
                  borderRadius: '16px',
                  padding: '15px',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  opacity: achievement.unlocked ? 1 : 0.6,
                  transform: 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {/* Бейдж потери */}
                {achievement.canLose && achievement.unlocked && (
                  <div style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    background: 'rgba(239, 68, 68, 0.9)',
                    borderRadius: '8px',
                    padding: '2px 6px',
                    fontSize: '10px',
                    color: 'white'
                  }}>
                    ⚠️ Может исчезнуть
                  </div>
                )}

                {/* Иконка */}
                <div style={{
                  fontSize: '40px',
                  marginBottom: '10px',
                  filter: achievement.unlocked ? 'none' : 'grayscale(100%)'
                }}>
                  {achievement.icon}
                </div>

                {/* Название */}
                <h4 style={{
                  fontSize: '14px',
                  marginBottom: '5px',
                  color: achievement.unlocked && achievement.rarity !== 'common'
                    ? 'white'
                    : 'var(--text-primary)'
                }}>
                  {achievement.title}
                </h4>

                {/* Описание */}
                <p style={{
                  fontSize: '11px',
                  color: achievement.unlocked && achievement.rarity !== 'common'
                    ? 'rgba(255,255,255,0.9)'
                    : 'var(--text-secondary)',
                  marginBottom: '10px'
                }}>
                  {achievement.description}
                </p>

                {/* Прогресс */}
                {!achievement.unlocked && (
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '10px',
                      marginBottom: '5px',
                      color: 'var(--text-secondary)'
                    }}>
                      <span>Прогресс</span>
                      <span>{achievement.currentProgress}/{achievement.requirement}</span>
                    </div>
                    <div style={{
                      height: '4px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(achievement.currentProgress / achievement.requirement) * 100}%`,
                        height: '100%',
                        background: 'var(--primary-gradient)',
                        borderRadius: '2px'
                      }} />
                    </div>
                  </div>
                )}

                {/* Дата разблокировки */}
                {achievement.unlocked && achievement.unlockedAt && (
                  <div style={{
                    fontSize: '10px',
                    color: achievement.rarity !== 'common'
                      ? 'rgba(255,255,255,0.7)'
                      : 'var(--text-secondary)',
                    marginTop: '5px'
                  }}>
                    ✓ {new Date(achievement.unlockedAt).toLocaleDateString('ru-RU')}
                  </div>
                )}

                {/* Очки */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  background: achievement.points > 0
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  padding: '4px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: achievement.unlocked && achievement.rarity !== 'common'
                    ? 'white'
                    : 'var(--text-primary)'
                }}>
                  {achievement.points > 0 ? '+' : ''}{achievement.points}
                </div>

                {/* Эффект сияния для легендарных */}
                {achievement.unlocked && achievement.rarity === 'legendary' && (
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)',
                    animation: 'pulse 2s ease-in-out infinite'
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Предупреждение о потере достижений */}
          {achievements.some(a => a.canLose && a.unlocked) && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))',
              borderRadius: '12px',
              padding: '15px',
              marginTop: '20px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <h4 style={{ marginBottom: '10px', color: '#ef4444' }}>
                ⚠️ Внимание!
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Некоторые достижения могут исчезнуть, если вы пропустите тренировки или перестанете заниматься.
                Поддерживайте регулярность, чтобы сохранить все награды!
              </p>
            </div>
          )}

          {/* Мотивационное сообщение */}
          {progress.percentage < 100 && (
            <div style={{
              background: 'var(--background-card)',
              borderRadius: '12px',
              padding: '15px',
              marginTop: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>💪</div>
              <h4 style={{ marginBottom: '5px' }}>Продолжайте в том же духе!</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                До следующего достижения осталось совсем немного.
                Каждая тренировка приближает вас к цели!
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AchievementsScreen;