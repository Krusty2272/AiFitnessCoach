import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressRing, CountUp } from './AnimatedComponents';
import hapticService from '../services/hapticService';
import telegramService from '../services/telegramService';

interface WorkoutTimerProps {
  onComplete?: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

export const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  onComplete,
  onPause,
  onResume
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(1);
  const [totalExercises] = useState(8);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
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
  }, [isRunning, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    hapticService.impact('medium');
    if (telegramService.isTelegramWebApp()) {
      telegramService.impactOccurred('medium');
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    hapticService.selection();
    
    if (isPaused) {
      onResume?.();
    } else {
      onPause?.();
    }
  };

  const handleComplete = () => {
    setIsRunning(false);
    hapticService.success();
    if (telegramService.isTelegramWebApp()) {
      telegramService.notificationOccurred('success');
    }
    onComplete?.();
  };

  const handleNextExercise = () => {
    if (currentExercise < totalExercises) {
      setCurrentExercise(prev => prev + 1);
      hapticService.impact('light');
    } else {
      handleComplete();
    }
  };

  const progress = (currentExercise / totalExercises) * 100;

  if (!isRunning) {
    return (
      <motion.div
        className="bg-gray-800 rounded-2xl p-6 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          Готовы начать тренировку?
        </h3>
        <p className="text-gray-400 mb-6">
          {totalExercises} упражнений • ~30 минут
        </p>
        <motion.button
          onClick={handleStart}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Начать тренировку
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-gray-800 rounded-2xl p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Прогресс */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-gray-400">Упражнение</p>
          <p className="text-2xl font-bold text-white">
            {currentExercise} / {totalExercises}
          </p>
        </div>
        
        <ProgressRing progress={progress} size={60} strokeWidth={4}>
          <span className="text-white font-bold">{Math.round(progress)}%</span>
        </ProgressRing>
      </div>

      {/* Таймер */}
      <div className="text-center mb-6">
        <motion.div
          className="text-5xl font-bold text-white mb-2"
          key={elapsedTime}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
        >
          {formatTime(elapsedTime)}
        </motion.div>
        <p className="text-gray-400">Время тренировки</p>
      </div>

      {/* Текущее упражнение */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentExercise}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-gray-900 rounded-xl p-4 mb-6"
        >
          <h4 className="text-lg font-semibold text-white mb-2">
            Отжимания
          </h4>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">3 подхода × 12 повт.</span>
            <span className="text-indigo-400">Отдых: 60 сек</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Управление */}
      <div className="flex space-x-3">
        <motion.button
          onClick={handlePause}
          className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
            isPaused 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-700 text-gray-300'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {isPaused ? 'Продолжить' : 'Пауза'}
        </motion.button>
        
        <motion.button
          onClick={handleNextExercise}
          className="flex-1 py-3 bg-indigo-500 text-white rounded-xl font-medium"
          whileTap={{ scale: 0.95 }}
        >
          {currentExercise === totalExercises ? 'Завершить' : 'Следующее'}
        </motion.button>
      </div>
    </motion.div>
  );
};

interface RestTimerProps {
  duration: number;
  onComplete: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      hapticService.success();
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
      
      if (timeLeft <= 3 && timeLeft > 0) {
        hapticService.impact('light');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 rounded-2xl p-8 max-w-sm w-full text-center"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
      >
        <h3 className="text-xl font-semibold text-white mb-6">Отдых</h3>
        
        <ProgressRing progress={progress} size={150} strokeWidth={10}>
          <div>
            <motion.div
              className="text-4xl font-bold text-white"
              key={timeLeft}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              {timeLeft}
            </motion.div>
            <p className="text-sm text-gray-400">секунд</p>
          </div>
        </ProgressRing>
        
        <motion.button
          onClick={onComplete}
          className="mt-6 px-6 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Пропустить
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

interface ExerciseCounterProps {
  exercise: string;
  targetReps: number;
  onComplete: (actualReps: number) => void;
}

export const ExerciseCounter: React.FC<ExerciseCounterProps> = ({
  exercise,
  targetReps,
  onComplete
}) => {
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    hapticService.impact('light');
    
    if (newCount >= targetReps) {
      setTimeout(() => {
        hapticService.success();
        onComplete(newCount);
      }, 500);
    }
  };

  const handleDecrement = () => {
    if (count > 0) {
      setCount(count - 1);
      hapticService.selection();
    }
  };

  const progress = Math.min((count / targetReps) * 100, 100);

  return (
    <div className="bg-gray-800 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{exercise}</h3>
      
      <div className="flex items-center justify-center mb-6">
        <ProgressRing progress={progress} size={180} strokeWidth={12}>
          <div className="text-center">
            <motion.div
              className="text-5xl font-bold text-white"
              key={count}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
            >
              {count}
            </motion.div>
            <p className="text-sm text-gray-400">из {targetReps}</p>
          </div>
        </ProgressRing>
      </div>
      
      <div className="flex space-x-3">
        <motion.button
          onClick={handleDecrement}
          className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-2xl text-gray-400">−</span>
        </motion.button>
        
        <motion.button
          onClick={handleIncrement}
          className="flex-1 h-16 bg-indigo-500 rounded-full flex items-center justify-center"
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-2xl text-white font-bold">+1</span>
        </motion.button>
        
        <motion.button
          onClick={() => onComplete(count)}
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
};