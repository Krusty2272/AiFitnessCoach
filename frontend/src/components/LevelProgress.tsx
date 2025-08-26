import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import levelService, { LevelData } from '../services/levelService';
import particleService from '../services/particleService';

interface LevelProgressProps {
  compact?: boolean;
  showDetails?: boolean;
  onLevelClick?: () => void;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({ 
  compact = false, 
  showDetails = true,
  onLevelClick 
}) => {
  const navigate = useNavigate();
  const [levelData, setLevelData] = useState<LevelData>(levelService.getLevelData());
  const [showXPAnimation, setShowXPAnimation] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLevelData(levelService.getLevelData());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (onLevelClick) {
      onLevelClick();
    } else {
      // Эффект при клике
      const rect = e.currentTarget.getBoundingClientRect();
      particleService.stars(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
      // Переход на детальный экран
      navigate('/level');
    }
  };

  if (compact) {
    return (
      <div 
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
          borderRadius: '20px',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          border: '1px solid rgba(102, 126, 234, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <div style={{
          fontSize: '18px',
          width: '28px',
          height: '28px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
        }}>
          {levelData.rankIcon}
        </div>
        <div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: 'var(--text-primary)'
          }}>
            Ур. {levelData.level}
          </div>
          {showDetails && (
            <div style={{ 
              fontSize: '10px', 
              color: 'var(--text-secondary)'
            }}>
              {levelData.currentXP}/{levelData.requiredXP} XP
            </div>
          )}
        </div>
        <div style={{
          width: '60px',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${levelData.progressPercentage}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            borderRadius: '2px',
            transition: 'width 0.5s ease',
            boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Фоновый паттерн */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 3s ease-in-out infinite'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Заголовок */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              fontSize: '40px',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              animation: 'glow 2s ease-in-out infinite'
            }}>
              {levelData.rankIcon}
            </div>
            <div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Уровень {levelData.level}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: 'var(--text-secondary)'
              }}>
                {levelData.rank}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--text-secondary)',
              marginBottom: '4px'
            }}>
              Всего XP
            </div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: 'bold',
              color: '#ffd700'
            }}>
              {levelData.totalXP.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Прогресс бар */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '12px'
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>Прогресс</span>
            <span style={{ 
              color: 'var(--text-primary)',
              fontWeight: 'bold'
            }}>
              {levelData.currentXP} / {levelData.requiredXP} XP
            </span>
          </div>
          <div style={{
            height: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${levelData.progressPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              borderRadius: '6px',
              transition: 'width 0.5s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Анимированный блик */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                animation: 'shimmer 2s infinite'
              }} />
            </div>
            {/* Процент по центру */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '10px',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}>
              {Math.round(levelData.progressPercentage)}%
            </div>
          </div>
        </div>

        {/* Следующий ранг */}
        {levelData.nextRank !== levelData.rank && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            <span>Следующий ранг:</span>
            <span style={{ 
              fontWeight: 'bold',
              color: 'var(--text-primary)'
            }}>
              {levelData.nextRank}
            </span>
          </div>
        )}

        {/* Множители опыта */}
        {levelService.getActiveMultipliers().length > 0 && (
          <div style={{
            marginTop: '10px',
            padding: '8px',
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))',
            borderRadius: '8px',
            border: '1px solid rgba(255, 215, 0, 0.3)'
          }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: 'bold',
              color: '#ffd700',
              marginBottom: '5px'
            }}>
              ⚡ Активные бонусы XP
            </div>
            {levelService.getActiveMultipliers().map((mult, index) => (
              <div key={index} style={{
                fontSize: '10px',
                color: 'var(--text-secondary)',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{mult.description}</span>
                <span style={{ color: '#ffd700' }}>x{mult.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Добавляем CSS анимацию shimmer
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 200%; }
  }
`;
document.head.appendChild(style);