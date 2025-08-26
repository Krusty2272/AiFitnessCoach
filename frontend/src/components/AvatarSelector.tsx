import React, { useState, Suspense, lazy } from 'react';
import userProfileService, { AvatarOption } from '../services/userProfileService';
import hapticService from '../services/hapticService';
import particleService from '../services/particleService';
import levelService from '../services/levelService';

// Ленивая загрузка 3D компонента
const Simple3DAvatar = lazy(() => 
  import('./Simple3DAvatar').then(module => ({ default: module.Simple3DAvatar }))
);

interface AvatarSelectorProps {
  currentAvatar: string;
  onSelect: (avatar: string, category: string) => void;
  onClose: () => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  currentAvatar,
  onSelect,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState('sport');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption | null>(null);
  const [previewTheme, setPreviewTheme] = useState(false);
  const categories = userProfileService.getAvatarCategories();
  const avatars = userProfileService.getAllAvatars();
  const userLevel = levelService.getLevelData().level;
  const autoTheme = localStorage.getItem('autoAvatarTheme') === 'true';

  const handleAvatarClick = (avatar: AvatarOption) => {
    const isUnlocked = userProfileService.isAvatarUnlocked(avatar);
    
    if (!isUnlocked) {
      hapticService.error();
      return;
    }
    
    hapticService.light();
    setSelectedAvatar(avatar);
    
    // Эффект при выборе
    const element = document.getElementById(`avatar-${avatar.emoji}`);
    if (element) {
      const rect = element.getBoundingClientRect();
      particleService.stars(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
    }
    
    // Предпросмотр темы если включено
    if (autoTheme && avatar.theme && previewTheme) {
      userProfileService.applyAvatarTheme(avatar.theme);
    }
  };

  const handleConfirm = () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar.emoji, selectedAvatar.category);
      hapticService.success();
      particleService.emojiExplosion(
        selectedAvatar.emoji,
        window.innerWidth / 2,
        window.innerHeight / 2,
        10
      );
      onClose();
    }
  };

  const handleRandomAvatar = () => {
    const randomAvatar = userProfileService.getRandomAvatar();
    setSelectedAvatar(randomAvatar);
    setSelectedCategory(randomAvatar.category);
    hapticService.medium();
    particleService.confetti({
      particleCount: 20,
      spread: 45,
      origin: { x: 0.5, y: 0.5 }
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10000,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {/* Заголовок */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--background-secondary)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <h2>Выберите аватар</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
        
        {/* Текущий выбор */}
        {selectedAvatar && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px',
            background: 'var(--background-card)',
            borderRadius: '12px'
          }}>
            <div style={{
              fontSize: '40px',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {selectedAvatar.emoji}
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>{selectedAvatar.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Нажмите "Выбрать" для подтверждения
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Категории */}
      <div style={{
        display: 'flex',
        gap: '5px',
        padding: '10px',
        overflowX: 'auto',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--background-secondary)'
      }}>
        {categories.map(cat => {
          const isLocked = cat.id === 'premium' && !isPremiumUnlocked;
          return (
            <button
              key={cat.id}
              onClick={() => !isLocked && setSelectedCategory(cat.id)}
              disabled={isLocked}
              style={{
                padding: '8px 16px',
                background: selectedCategory === cat.id 
                  ? 'var(--primary-gradient)'
                  : isLocked 
                    ? 'rgba(128, 128, 128, 0.2)'
                    : 'var(--background-card)',
                border: 'none',
                borderRadius: '20px',
                color: isLocked ? 'var(--text-secondary)' : 'white',
                fontSize: '14px',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                position: 'relative'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              {isLocked && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px'
                }}>
                  🔒
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Настройка предпросмотра темы */}
      {autoTheme && (
        <div style={{
          padding: '10px 20px',
          background: 'var(--background-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={previewTheme}
              onChange={(e) => {
                setPreviewTheme(e.target.checked);
                if (!e.target.checked) {
                  // Возвращаем текущую тему
                  const current = userProfileService.findAvatarByEmoji(currentAvatar);
                  if (current?.theme) {
                    userProfileService.applyAvatarTheme(current.theme);
                  }
                }
              }}
              style={{ width: '20px', height: '20px' }}
            />
            <span style={{ fontSize: '14px' }}>
              🎨 Предпросмотр темы аватарки
            </span>
          </label>
        </div>
      )}

      {/* Сетка аватарок */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        padding: '20px'
      }}>
        {selectedCategory === 'premium' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '12px',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', marginBottom: '10px' }}>⚡ Элитные аватары</div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Открываются по мере роста уровня
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center'
            }}>
              {avatars[selectedCategory]?.map(avatar => avatar.requiredLevel && (
                <div key={avatar.emoji} style={{
                  padding: '4px 8px',
                  background: userLevel >= avatar.requiredLevel 
                    ? 'linear-gradient(135deg, #4ade80, #22c55e)'
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {avatar.emoji} Ур.{avatar.requiredLevel}
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '10px'
          }}>
            {avatars[selectedCategory]?.map(avatar => {
              const isLocked = !userProfileService.isAvatarUnlocked(avatar);
              return (
              <button
                key={avatar.emoji}
                id={`avatar-${avatar.emoji}`}
                onClick={() => handleAvatarClick(avatar)}
                style={{
                  padding: '10px',
                  background: isLocked
                    ? 'linear-gradient(135deg, rgba(128, 128, 128, 0.2), rgba(128, 128, 128, 0.1))'
                    : selectedAvatar?.emoji === avatar.emoji
                      ? avatar.theme 
                        ? `linear-gradient(135deg, ${avatar.theme.primary}, ${avatar.theme.secondary})`
                        : 'linear-gradient(135deg, #667eea, #764ba2)'
                      : currentAvatar === avatar.emoji
                        ? 'var(--background-card)'
                        : 'transparent',
                  border: isLocked
                    ? '2px solid rgba(128, 128, 128, 0.3)'
                    : currentAvatar === avatar.emoji
                      ? '2px solid #667eea'
                      : '2px solid transparent',
                  borderRadius: '12px',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px',
                  position: 'relative',
                  opacity: isLocked ? 0.5 : 1,
                  filter: isLocked ? 'grayscale(0.5)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isLocked) {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLocked) {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {selectedCategory === 'premium' ? (
                  <Suspense fallback={
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      ⏳
                    </div>
                  }>
                    <Simple3DAvatar
                      type={avatar.name.toLowerCase().replace(/\s/g, '')}
                      isSelected={selectedAvatar?.emoji === avatar.emoji}
                      isLocked={isLocked}
                      size={60}
                    />
                  </Suspense>
                ) : (
                  <span style={{ fontSize: '36px' }}>{avatar.emoji}</span>
                )}
                <span style={{ 
                  fontSize: '10px',
                  fontWeight: avatar.requiredLevel ? 'bold' : 'normal'
                }}>
                  {avatar.name}
                </span>
                {avatar.requiredLevel && (
                  <span style={{
                    fontSize: '9px',
                    color: isLocked ? '#ef4444' : '#4ade80',
                    fontWeight: 'bold'
                  }}>
                    Ур.{avatar.requiredLevel}
                  </span>
                )}
                {isLocked && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '24px',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                  }}>
                    🔒
                  </div>
                )}
                {avatar.theme && !isLocked && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '-8px',
                    background: `linear-gradient(135deg, ${avatar.theme.primary}, ${avatar.theme.secondary})`,
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    animation: 'pulse 2s infinite',
                    boxShadow: `0 0 10px ${avatar.theme.accent}66`
                  }}>
                    🎨
                  </div>
                )}
                {currentAvatar === avatar.emoji && (
                  <div style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#4ade80',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}>
                    ✓
                  </div>
                )}
              </button>
            );
            })}
          </div>
      </div>

      {/* Кнопки действий */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--background-secondary)',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={handleRandomAvatar}
          style={{
            padding: '12px 20px',
            background: 'var(--background-card)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🎲 Случайный
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedAvatar}
          style={{
            flex: 1,
            padding: '12px',
            background: selectedAvatar ? 'var(--primary-gradient)' : 'var(--background-card)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: selectedAvatar ? 'pointer' : 'not-allowed',
            opacity: selectedAvatar ? 1 : 0.5
          }}
        >
          Выбрать
        </button>
      </div>
    </div>
  );
};