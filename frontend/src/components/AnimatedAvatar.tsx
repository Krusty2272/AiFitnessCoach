import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface AnimatedAvatarProps {
  type: string;
  size?: number;
  isActive?: boolean;
  onClick?: () => void;
}

// Простые SVG аватары с CSS анимациями (вместо 3D)
const avatarStyles: Record<string, any> = {
  runner: {
    emoji: '🏃',
    color: 'linear-gradient(135deg, #667eea, #764ba2)',
    animation: 'bounce 2s infinite'
  },
  lifter: {
    emoji: '🏋️',
    color: 'linear-gradient(135deg, #f093fb, #f5576c)',
    animation: 'pulse 1.5s infinite'
  },
  boxer: {
    emoji: '🥊',
    color: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    animation: 'shake 1s infinite'
  },
  yogi: {
    emoji: '🧘',
    color: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    animation: 'float 3s ease-in-out infinite'
  },
  swimmer: {
    emoji: '🏊',
    color: 'linear-gradient(135deg, #fa709a, #fee140)',
    animation: 'wave 2s infinite'
  },
  cyclist: {
    emoji: '🚴',
    color: 'linear-gradient(135deg, #30cfd0, #330867)',
    animation: 'spin 3s linear infinite'
  },
  dancer: {
    emoji: '💃',
    color: 'linear-gradient(135deg, #a8edea, #fed6e3)',
    animation: 'dance 1.5s ease-in-out infinite'
  },
  climber: {
    emoji: '🧗',
    color: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
    animation: 'climb 2s infinite'
  }
};

export const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({
  type = 'runner',
  size = 80,
  isActive = false,
  onClick
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const avatar = avatarStyles[type] || avatarStyles.runner;

  useEffect(() => {
    // Анимация только при активности
    setIsAnimating(isActive);
  }, [isActive]);

  // Для Lottie анимаций (если есть JSON файлы)
  // const [animationData, setAnimationData] = useState(null);
  // useEffect(() => {
  //   import(`../assets/lottie/${type}.json`).then(setAnimationData);
  // }, [type]);

  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: avatar.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        boxShadow: isActive ? '0 10px 30px rgba(0,0,0,0.3)' : '0 5px 15px rgba(0,0,0,0.2)',
        transform: isActive ? 'scale(1.1)' : 'scale(1)',
        transition: 'all 0.3s ease',
        animation: isAnimating ? avatar.animation : 'none'
      }}
    >
      {/* Emoji аватар */}
      <span style={{
        fontSize: size * 0.5,
        filter: isActive ? 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' : 'none',
        userSelect: 'none'
      }}>
        {avatar.emoji}
      </span>

      {/* Пульсирующий эффект при активности */}
      {isActive && (
        <div style={{
          position: 'absolute',
          top: -5,
          left: -5,
          right: -5,
          bottom: -5,
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.5)',
          animation: 'pulse 1s infinite',
          pointerEvents: 'none'
        }} />
      )}

      {/* Если будем использовать Lottie */}
      {/* {animationData && (
        <Lottie
          animationData={animationData}
          loop={isAnimating}
          autoplay={isAnimating}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute'
          }}
        />
      )} */}
    </div>
  );
};

// CSS анимации
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  @keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-10deg); }
    75% { transform: rotate(10deg); }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes dance {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    25% { transform: translateX(-5px) rotate(-5deg); }
    75% { transform: translateX(5px) rotate(5deg); }
  }

  @keyframes climb {
    0%, 100% { transform: translateY(0); }
    25% { transform: translateY(-5px) translateX(2px); }
    75% { transform: translateY(5px) translateX(-2px); }
  }
`;
document.head.appendChild(style);