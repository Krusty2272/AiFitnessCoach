import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import levelService, { LevelData, XPSource, XPMultiplier } from '../services/levelService';
import { LevelProgress } from '../components/LevelProgress';
import hapticService from '../services/hapticService';

const LevelDetailsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [levelData, setLevelData] = useState<LevelData>(levelService.getLevelData());
  const [xpHistory, setXpHistory] = useState<XPSource[]>(levelService.getXPHistory());
  const [multipliers, setMultipliers] = useState<XPMultiplier[]>(levelService.getActiveMultipliers());
  const [dailyStreak, setDailyStreak] = useState(levelService.getDailyStreak());
  const [activeTab, setActiveTab] = useState<'progress' | 'history' | 'bonuses'>('progress');

  useEffect(() => {
    const interval = setInterval(() => {
      setLevelData(levelService.getLevelData());
      setXpHistory(levelService.getXPHistory());
      setMultipliers(levelService.getActiveMultipliers());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const calculateTimeToNextLevel = (): string => {
    const xpNeeded = levelData.requiredXP - levelData.currentXP;
    const avgXpPerDay = 200; // Примерно
    const daysNeeded = Math.ceil(xpNeeded / avgXpPerDay);
    
    if (daysNeeded === 1) return '1 день';
    if (daysNeeded < 5) return `${daysNeeded} дня`;
    return `${daysNeeded} дней`;
  };

  const tabs = [
    { id: 'progress' as const, label: 'Прогресс', icon: '📈' },
    { id: 'history' as const, label: 'История', icon: '📜' },
    { id: 'bonuses' as const, label: 'Бонусы', icon: '⚡' }
  ];

  return (
    <div className="app-content">
      <div className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <h1>Система уровней</h1>
        </div>
        <p>Зарабатывайте опыт и повышайте уровень</p>
      </div>

      {/* Основная информация о уровне */}
      <div style={{ padding: '10px' }}>
        <LevelProgress showDetails={true} />
      </div>

      {/* Табы */}
      <div style={{
        display: 'flex',
        gap: '5px',
        padding: '10px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              hapticService.light();
            }}
            style={{
              flex: 1,
              padding: '10px',
              background: activeTab === tab.id ? 'var(--primary-gradient)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: '100px' }}>
        {activeTab === 'progress' && (
          <div style={{ padding: '20px' }}>
            {/* Статистика */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <div style={{
                background: 'var(--background-card)',
                borderRadius: '12px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>📅</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{dailyStreak}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Дней подряд</div>
              </div>
              
              <div style={{
                background: 'var(--background-card)',
                borderRadius: '12px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>⏰</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{calculateTimeToNextLevel()}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>До след. уровня</div>
              </div>
              
              <div style={{
                background: 'var(--background-card)',
                borderRadius: '12px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>💰</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{levelData.totalXP.toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Всего XP</div>
              </div>
              
              <div style={{
                background: 'var(--background-card)',
                borderRadius: '12px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>{levelData.rankIcon}</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{levelData.rank}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Текущий ранг</div>
              </div>
            </div>

            {/* Прогресс до следующих уровней */}
            <div style={{
              background: 'var(--background-card)',
              borderRadius: '12px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginBottom: '15px' }}>Предстоящие уровни</h3>
              {[1, 2, 3, 4, 5].map(offset => {
                const futureLevel = levelData.level + offset;
                const requiredXP = levelService['calculateRequiredXP'](futureLevel);
                
                return (
                  <div key={offset} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: offset < 5 ? '1px solid var(--border-color)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(102, 126, 234, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>
                        {futureLevel}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                          Уровень {futureLevel}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Требуется {requiredXP.toLocaleString()} XP
                        </div>
                      </div>
                    </div>
                    {futureLevel % 10 === 0 && (
                      <span style={{
                        padding: '4px 8px',
                        background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: 'black'
                      }}>
                        Особый
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>История получения XP</h3>
            {xpHistory.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📝</div>
                <p>История пока пуста</p>
                <p style={{ fontSize: '12px' }}>Начните тренироваться, чтобы заработать XP!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {xpHistory.reverse().map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'var(--background-card)',
                      borderRadius: '8px',
                      padding: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <div style={{ fontSize: '24px' }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {item.timestamp && new Date(item.timestamp).toLocaleTimeString('ru-RU')}
                        {item.multiplier && item.multiplier > 1 && (
                          <span style={{ color: '#ffd700', marginLeft: '5px' }}>
                            x{item.multiplier.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#4ade80'
                    }}>
                      +{item.xp}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bonuses' && (
          <div style={{ padding: '20px' }}>
            {/* Активные множители */}
            {multipliers.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Активные бонусы</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {multipliers.map((mult, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))',
                        borderRadius: '12px',
                        padding: '15px',
                        border: '1px solid rgba(255, 215, 0, 0.3)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontWeight: 'bold' }}>{mult.description}</span>
                        <span style={{ color: '#ffd700', fontWeight: 'bold' }}>x{mult.value}</span>
                      </div>
                      {mult.expiresAt && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Истекает: {new Date(mult.expiresAt).toLocaleTimeString('ru-RU')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Источники XP */}
            <div>
              <h3 style={{ marginBottom: '15px' }}>Как заработать XP</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  💪 Тренировки
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { name: 'Завершение тренировки', xp: 50, icon: '✅' },
                    { name: 'Идеальная тренировка', xp: 100, icon: '⭐' },
                    { name: 'Утренняя тренировка', xp: 25, icon: '🌅', bonus: 'x1.3' },
                    { name: 'Личный рекорд', xp: 75, icon: '🎯' }
                  ].map((source, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'var(--background-card)',
                        borderRadius: '8px',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{source.icon}</span>
                      <span style={{ flex: 1, fontSize: '14px' }}>{source.name}</span>
                      <span style={{ fontWeight: 'bold', color: '#4ade80' }}>
                        +{source.xp} XP
                      </span>
                      {source.bonus && (
                        <span style={{ fontSize: '12px', color: '#ffd700' }}>
                          {source.bonus}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  👥 Социальные
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { name: 'Добавление друга', xp: 20, icon: '🤝' },
                    { name: 'Победа в челлендже', xp: 150, icon: '🥇' },
                    { name: 'Получен лайк', xp: 5, icon: '❤️' },
                    { name: 'Поделиться результатом', xp: 15, icon: '📱' }
                  ].map((source, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'var(--background-card)',
                        borderRadius: '8px',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{source.icon}</span>
                      <span style={{ flex: 1, fontSize: '14px' }}>{source.name}</span>
                      <span style={{ fontWeight: 'bold', color: '#4ade80' }}>
                        +{source.xp} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                  📅 Ежедневные
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { name: 'Ежедневный вход', xp: 10, icon: '📅' },
                    { name: 'Неделя входов подряд', xp: 100, icon: '7️⃣' },
                    { name: 'Тренировка в выходные', xp: 40, icon: '🎉', bonus: 'x1.5' }
                  ].map((source, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'var(--background-card)',
                        borderRadius: '8px',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{source.icon}</span>
                      <span style={{ flex: 1, fontSize: '14px' }}>{source.name}</span>
                      <span style={{ fontWeight: 'bold', color: '#4ade80' }}>
                        +{source.xp} XP
                      </span>
                      {source.bonus && (
                        <span style={{ fontSize: '12px', color: '#ffd700' }}>
                          {source.bonus}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default LevelDetailsScreen;