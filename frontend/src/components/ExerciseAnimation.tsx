import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface ExerciseAnimationProps {
  exercise: string;
  isPlaying?: boolean;
  reps?: number;
  currentRep?: number;
  size?: number;
}

// Простые CSS анимации для упражнений (легковесная альтернатива)
const exerciseAnimations: Record<string, any> = {
  pushups: {
    emoji: '🤸',
    keyframes: `
      @keyframes pushup {
        0% { transform: translateY(0) rotateZ(0deg); }
        50% { transform: translateY(10px) rotateZ(-5deg); }
        100% { transform: translateY(0) rotateZ(0deg); }
      }
    `,
    animation: 'pushup 1s ease-in-out infinite'
  },
  squats: {
    emoji: '🏋️',
    keyframes: `
      @keyframes squat {
        0% { transform: translateY(0) scaleY(1); }
        50% { transform: translateY(20px) scaleY(0.9); }
        100% { transform: translateY(0) scaleY(1); }
      }
    `,
    animation: 'squat 1.2s ease-in-out infinite'
  },
  plank: {
    emoji: '🧘',
    keyframes: `
      @keyframes plank {
        0%, 100% { transform: scaleX(1); opacity: 1; }
        50% { transform: scaleX(1.02); opacity: 0.9; }
      }
    `,
    animation: 'plank 2s ease-in-out infinite'
  },
  jumps: {
    emoji: '🤾',
    keyframes: `
      @keyframes jump {
        0%, 100% { transform: translateY(0) scaleY(1); }
        25% { transform: translateY(-5px) scaleY(1.1); }
        50% { transform: translateY(-30px) scaleY(1); }
        75% { transform: translateY(-5px) scaleY(0.95); }
      }
    `,
    animation: 'jump 0.8s ease-in-out infinite'
  },
  running: {
    emoji: '🏃',
    keyframes: `
      @keyframes run {
        0%, 100% { transform: translateX(0) rotate(0deg); }
        25% { transform: translateX(5px) rotate(5deg); }
        75% { transform: translateX(-5px) rotate(-5deg); }
      }
    `,
    animation: 'run 0.5s linear infinite'
  },
  situps: {
    emoji: '🙇',
    keyframes: `
      @keyframes situp {
        0%, 100% { transform: rotateX(0deg); }
        50% { transform: rotateX(30deg) translateY(-10px); }
      }
    `,
    animation: 'situp 1s ease-in-out infinite'
  },
  lunges: {
    emoji: '🚶',
    keyframes: `
      @keyframes lunge {
        0%, 100% { transform: translateX(0) translateY(0); }
        25% { transform: translateX(10px) translateY(5px); }
        50% { transform: translateX(20px) translateY(0); }
        75% { transform: translateX(10px) translateY(5px); }
      }
    `,
    animation: 'lunge 2s ease-in-out infinite'
  },
  burpees: {
    emoji: '🤯',
    keyframes: `
      @keyframes burpee {
        0% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(0.8) rotate(90deg); }
        50% { transform: scale(1.2) rotate(180deg); }
        75% { transform: scale(0.9) rotate(270deg); }
        100% { transform: scale(1) rotate(360deg); }
      }
    `,
    animation: 'burpee 1.5s ease-in-out infinite'
  }
};

export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({
  exercise,
  isPlaying = false,
  reps = 0,
  currentRep = 0,
  size = 120
}) => {
  const [animationSpeed, setAnimationSpeed] = useState('1s');
  const exerciseData = exerciseAnimations[exercise.toLowerCase()] || exerciseAnimations.pushups;

  useEffect(() => {
    // Ускоряем анимацию по мере прогресса
    if (currentRep > reps / 2) {
      setAnimationSpeed('0.8s');
    }
    if (currentRep > reps * 0.75) {
      setAnimationSpeed('0.6s');
    }
  }, [currentRep, reps]);

  // Добавляем CSS для анимации
  useEffect(() => {
    const styleId = `exercise-animation-${exercise}`;
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = exerciseData.keyframes;
      document.head.appendChild(styleElement);
    }

    return () => {
      // Очистка не нужна, оставляем стили для переиспользования
    };
  }, [exercise]);

  // Для будущего использования с Lottie файлами
  // const [lottieData, setLottieData] = useState(null);
  // useEffect(() => {
  //   fetch(`/animations/${exercise}.json`)
  //     .then(res => res.json())
  //     .then(setLottieData)
  //     .catch(() => console.log('No Lottie animation for', exercise));
  // }, [exercise]);

  return (
    <div style={{
      width: size,
      height: size,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Счетчик повторений */}
      {reps > 0 && (
        <div style={{
          position: 'absolute',
          top: -20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--primary-gradient)',
          borderRadius: '20px',
          padding: '5px 15px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px',
          zIndex: 10
        }}>
          {currentRep} / {reps}
        </div>
      )}

      {/* Анимированный emoji */}
      <div style={{
        fontSize: size * 0.6,
        animation: isPlaying ? exerciseData.animation : 'none',
        animationDuration: animationSpeed,
        transformOrigin: 'center bottom',
        userSelect: 'none',
        filter: isPlaying ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' : 'none',
        transition: 'filter 0.3s ease'
      }}>
        {exerciseData.emoji}
      </div>

      {/* Если есть Lottie анимация */}
      {/* {lottieData && (
        <Lottie
          animationData={lottieData}
          loop={isPlaying}
          autoplay={isPlaying}
          speed={parseFloat(animationSpeed)}
          style={{
            width: size,
            height: size,
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
      )} */}

      {/* Прогресс-бар */}
      {reps > 0 && (
        <div style={{
          position: 'absolute',
          bottom: -10,
          left: 0,
          right: 0,
          height: '4px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(currentRep / reps) * 100}%`,
            height: '100%',
            background: 'var(--primary-gradient)',
            transition: 'width 0.3s ease',
            borderRadius: '2px'
          }} />
        </div>
      )}

      {/* Название упражнения */}
      <div style={{
        position: 'absolute',
        bottom: -30,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        whiteSpace: 'nowrap'
      }}>
        {exercise}
      </div>
    </div>
  );
};

// Вспомогательный компонент для отображения списка упражнений
export const ExerciseList: React.FC<{ exercises: string[] }> = ({ exercises }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
      gap: '20px',
      padding: '20px'
    }}>
      {exercises.map(exercise => (
        <div key={exercise} style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <ExerciseAnimation
            exercise={exercise}
            isPlaying={false}
            size={80}
          />
        </div>
      ))}
    </div>
  );
};