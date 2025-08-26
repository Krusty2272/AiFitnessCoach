import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import workoutStorage, { WorkoutSession } from '../services/workoutStorage';
import soundService from '../services/soundService';
import particleService from '../services/particleService';
import achievementService from '../services/achievementService';
import socialService from '../services/socialService';
import levelService from '../services/levelService';
import { ExerciseAnimation } from '../components/ExerciseAnimation';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps?: number;
  duration?: number; // в секундах
  rest: number; // в секундах
  description?: string;
}

const WorkoutExecutionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [startTime] = useState(new Date().toISOString());
  const [completedExercises, setCompletedExercises] = useState<boolean[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock данные тренировки
  const exercises: Exercise[] = [
    {
      id: '1',
      name: 'Отжимания',
      sets: 3,
      reps: 15,
      rest: 60,
      description: 'Классические отжимания от пола'
    },
    {
      id: '2',
      name: 'Планка',
      sets: 3,
      duration: 60,
      rest: 45,
      description: 'Удержание планки на локтях'
    },
    {
      id: '3',
      name: 'Приседания',
      sets: 4,
      reps: 20,
      rest: 60,
      description: 'Приседания с собственным весом'
    }
  ];

  const currentExercise = exercises[currentExerciseIndex];

  useEffect(() => {
    if (currentExercise?.duration && !isPaused) {
      setTimeRemaining(isResting ? currentExercise.rest : currentExercise.duration);
    }
  }, [currentExerciseIndex, currentSet, isResting]);

  useEffect(() => {
    if (timeRemaining > 0 && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          // Предупреждение за 3 секунды
          if (prev === 4 && !isResting) {
            soundService.playWarning();
          }
          // Обратный отсчет последних 3 секунд
          if (prev <= 3 && prev > 0) {
            soundService.playCountdown(prev);
          }
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeRemaining, isPaused]);

  const handleTimerComplete = () => {
    if (isResting) {
      soundService.playRestEnd();
      setIsResting(false);
      if (currentSet < currentExercise.sets) {
        setCurrentSet(prev => prev + 1);
        soundService.playExerciseStart();
      } else {
        handleNextExercise();
      }
    } else {
      soundService.playExerciseComplete();
      // Добавляем эффект огня для интенсивной тренировки
      particleService.fire(
        window.innerWidth / 2,
        window.innerHeight - 100
      );
      if (currentExercise.duration) {
        startRest();
      }
    }
  };

  const startRest = () => {
    soundService.playRestStart();
    setIsResting(true);
    setTimeRemaining(currentExercise.rest);
  };

  const handleNextSet = () => {
    if (currentSet < currentExercise.sets) {
      setCurrentSet(prev => prev + 1);
      startRest();
    } else {
      handleNextExercise();
    }
  };

  const handleNextExercise = () => {
    // Отмечаем текущее упражнение как выполненное
    const newCompleted = [...completedExercises];
    newCompleted[currentExerciseIndex] = true;
    setCompletedExercises(newCompleted);
    
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setIsResting(false);
    } else {
      handleWorkoutComplete();
    }
  };

  const handleWorkoutComplete = () => {
    setWorkoutComplete(true);
    soundService.playWorkoutComplete();
    
    // Запускаем конфетти и эффекты
    particleService.confetti({
      particleCount: 100,
      spread: 90,
      origin: { x: 0.5, y: 0.6 }
    });
    
    // Добавляем эмодзи взрыв
    setTimeout(() => {
      particleService.emojiExplosion(
        '💪',
        window.innerWidth / 2,
        window.innerHeight / 2,
        15
      );
    }, 500);
    
    // Сохраняем тренировку в историю
    const endTime = new Date().toISOString();
    const duration = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000);
    const calories = Math.floor(duration * 8); // Примерный расчет калорий
    
    const session: WorkoutSession = {
      id: `workout_${Date.now()}`,
      workoutId: id || 'unknown',
      workoutName: 'Тренировка', // Можно получить из данных тренировки
      date: new Date().toISOString().split('T')[0],
      startTime,
      endTime,
      duration,
      exercises: exercises.map((ex, index) => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        duration: ex.duration,
        completed: completedExercises[index] || index === currentExerciseIndex
      })),
      calories, // Используем ранее рассчитанные калории
      completed: true
    };
    
    workoutStorage.addWorkoutSession(session);
    
    // Обновляем достижения
    achievementService.checkAchievements();
    achievementService.checkTimeBasedAchievements();
    
    // Начисляем опыт
    const totalXP = levelService.onWorkoutComplete(duration, exercises.length, calories);
    
    // Опыт за каждое упражнение
    for (let i = 0; i < exercises.length; i++) {
      levelService.addXP('EXERCISE_COMPLETE');
    }
    
    // Делимся результатом
    socialService.shareResult({
      workoutName: 'Интенсивная тренировка',
      duration,
      calories,
      exercises: exercises.length
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentExerciseIndex + (currentSet / currentExercise.sets)) / exercises.length) * 100;

  if (workoutComplete) {
    return (
      <div className="app-content">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          padding: '20px'
        }}>
          <div style={{ fontSize: '72px', marginBottom: '20px' }}>🎉</div>
          <h1 style={{ marginBottom: '10px' }}>Тренировка завершена!</h1>
          <p style={{ color: '#8e8e93', marginBottom: '30px' }}>Отличная работа!</p>
          
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '20px',
            width: '100%',
            marginBottom: '20px'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <span style={{ color: '#8e8e93' }}>Выполнено упражнений:</span>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{exercises.length}</div>
            </div>
            <div>
              <span style={{ color: '#8e8e93' }}>Общее время:</span>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>15:30</div>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-content">
      <div className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            onClick={() => navigate('/workout/select')}
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
          <h2>Тренировка</h2>
          <button 
            onClick={() => setIsPaused(!isPaused)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8e8e93',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
        </div>
        
        {/* Progress bar */}
        <div style={{
          marginTop: '10px',
          height: '4px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            transition: 'width 0.3s'
          }} />
        </div>
      </div>

      <div style={{ 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100% - 100px)'
      }}>
        {/* Текущее упражнение */}
        <div style={{
          background: isResting ? 'rgba(255,165,0,0.1)' : 'rgba(102,126,234,0.1)',
          borderRadius: '20px',
          padding: '30px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>
            {isResting ? '🧘 Отдых' : currentExercise.name}
          </h2>
          
          {!isResting && currentExercise.description && (
            <p style={{ color: '#8e8e93', marginBottom: '20px' }}>
              {currentExercise.description}
            </p>
          )}

          <div style={{ fontSize: '20px', color: '#8e8e93', marginBottom: '10px' }}>
            Подход {currentSet} из {currentExercise.sets}
          </div>

          {currentExercise.duration || isResting ? (
            <div style={{ 
              position: 'relative',
              width: '200px',
              height: '200px',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Круговой прогресс */}
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: 'rotate(-90deg)'
                }}
                width="200"
                height="200"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke={isResting ? '#ffa500' : '#667eea'}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - (timeRemaining / (isResting ? currentExercise.rest : currentExercise.duration!)))}`}
                  style={{
                    transition: 'stroke-dashoffset 1s linear'
                  }}
                />
              </svg>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold',
                color: timeRemaining <= 3 ? '#ff4444' : 'white'
              }}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>
              {currentExercise.reps} повторений
            </div>
          )}
        </div>

        {/* Кнопки управления */}
        <div style={{ marginTop: 'auto' }}>
          {!currentExercise.duration && !isResting && (
            <button
              onClick={handleNextSet}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              {currentSet < currentExercise.sets ? 'Следующий подход' : 'Следующее упражнение'}
            </button>
          )}

          <button
            onClick={() => {
              if (isResting) {
                setIsResting(false);
                handleNextSet();
              } else {
                handleNextExercise();
              }
            }}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Пропустить
          </button>
        </div>

        {/* Следующее упражнение */}
        {currentExerciseIndex < exercises.length - 1 && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <span style={{ color: '#8e8e93', fontSize: '14px' }}>Далее: </span>
            <span style={{ fontSize: '14px' }}>{exercises[currentExerciseIndex + 1].name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutExecutionScreen;