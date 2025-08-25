import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TelegramService } from '../services/telegramService';

interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface WorkoutExercise {
  id: number;
  exercise_id: number;
  sets: number;
  reps: number;
  weight?: number;
  duration_seconds?: number;
  rest_seconds: number;
  order: number;
  completed: boolean;
  completed_sets: number;
  exercise: Exercise;
}

interface Workout {
  id: number;
  user_id: number;
  name: string;
  workout_type?: string;
  duration_minutes?: number;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  exercises: WorkoutExercise[];
}

export const WorkoutPage: React.FC = () => {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (TelegramService.isTelegramWebApp()) {
      TelegramService.init();
    }

    // Simulate loading workout data
    const mockWorkout: Workout = {
      id: 1,
      user_id: 123456789,
      name: 'Силовая тренировка',
      workout_type: 'strength',
      duration_minutes: 45,
      completed: false,
      created_at: new Date().toISOString(),
      exercises: [
        {
          id: 1,
          exercise_id: 1,
          sets: 3,
          reps: 12,
          rest_seconds: 60,
          order: 1,
          completed: false,
          completed_sets: 0,
          exercise: {
            id: 1,
            name: 'Отжимания',
            muscle_group: 'chest',
            description: 'Классические отжимания для проработки грудных мышц',
            is_active: true,
            created_at: new Date().toISOString()
          },
          weight: undefined,
          duration_seconds: undefined
        },
        {
          id: 2,
          exercise_id: 2,
          sets: 3,
          reps: 10,
          rest_seconds: 90,
          order: 2,
          completed: false,
          completed_sets: 0,
          exercise: {
            id: 2,
            name: 'Приседания со штангой',
            muscle_group: 'legs',
            description: 'Приседания для проработки мышц ног и ягодиц',
            is_active: true,
            created_at: new Date().toISOString()
          },
          weight: 60,
          duration_seconds: undefined
        },
        {
          id: 3,
          exercise_id: 3,
          sets: 4,
          reps: 8,
          rest_seconds: 120,
          order: 3,
          completed: false,
          completed_sets: 0,
          exercise: {
            id: 3,
            name: 'Подтягивания',
            muscle_group: 'back',
            description: 'Подтягивания для проработки мышц спины',
            is_active: true,
            created_at: new Date().toISOString()
          },
          weight: undefined,
          duration_seconds: undefined
        }
      ]
    };

    setWorkout(mockWorkout);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else if (!isTimerActive && timer !== 0) {
      clearInterval(interval!);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExercise = () => {
    setIsTimerActive(true);
  };

  const handleCompleteSet = () => {
    if (!workout) return;
    
    const currentExercise = workout.exercises[currentExerciseIndex];
    if (currentExercise.completed_sets < currentExercise.sets) {
      // Update completed sets
      const updatedWorkout = { ...workout };
      updatedWorkout.exercises[currentExerciseIndex].completed_sets += 1;
      
      if (updatedWorkout.exercises[currentExerciseIndex].completed_sets === currentExercise.sets) {
        // All sets completed, move to rest timer
        updatedWorkout.exercises[currentExerciseIndex].completed = true;
        setIsTimerActive(false);
        setTimer(0);
      }
      
      setWorkout(updatedWorkout);
    }
  };

  const handleNextExercise = () => {
    if (!workout) return;
    
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setIsTimerActive(false);
      setTimer(0);
    } else {
      // Workout completed
      setIsCompleted(true);
      setIsTimerActive(false);
      setTimer(0);
      
      if (TelegramService.isTelegramWebApp()) {
        TelegramService.showAlert('Тренировка завершена! Отличная работа!');
      }
    }
  };

  const handleBack = () => {
    window.history.pushState({}, '', '/');
  };

  if (!workout) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Загрузка тренировки...</p>
        </div>
      </div>
    );
  }

  const currentExercise = workout.exercises[currentExerciseIndex];
  const progress = Math.round((currentExerciseIndex / workout.exercises.length) * 100);

  return (
    <div className="min-h-screen bg-gray-900 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4 pb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            {workout.name}
          </h1>
          <p className="text-gray-400">
            Прогресс: {currentExerciseIndex + 1} / {workout.exercises.length}
          </p>
        </div>

        {/* Progress */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Прогресс</span>
            <span>{currentExerciseIndex + 1} / {workout.exercises.length}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {isCompleted ? (
          /* Workout Completed */
          <Card className="text-center fade-in">
            <CardContent className="py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full mx-auto flex items-center justify-center mb-6">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Тренировка завершена!</h2>
              <p className="text-gray-400 mb-6">
                Отличная работа! Вы успешно завершили тренировку.
              </p>
              <Button
                onClick={handleBack}
                className="w-full"
                size="lg"
                variant="success"
              >
                Вернуться домой
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Current Exercise */}
            <Card className="slide-up">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>💪 {currentExercise.exercise.name}</span>
                  <span className="text-sm font-normal text-gray-400">
                    {currentExercise.completed_sets}/{currentExercise.sets} подходов
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Повторения</div>
                    <div className="text-2xl font-bold text-white">{currentExercise.reps}</div>
                  </div>
                  {currentExercise.weight && (
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-1">Вес</div>
                      <div className="text-2xl font-bold text-white">{currentExercise.weight} кг</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Отдых</div>
                    <div className="text-2xl font-bold text-white">{currentExercise.rest_seconds} сек</div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-2">Описание</div>
                  <p className="text-gray-300 text-sm">
                    {currentExercise.exercise.description}
                  </p>
                </div>

                {/* Timer */}
                <div className="text-center py-4">
                  <div className="text-4xl font-mono font-bold text-indigo-400 mb-4">
                    {formatTime(timer)}
                  </div>
                  {!isTimerActive ? (
                    <Button
                      onClick={handleStartExercise}
                      className="w-full"
                      size="lg"
                      variant="primary"
                    >
                      Начать упражнение
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        onClick={handleCompleteSet}
                        className="w-full"
                        size="lg"
                        variant="success"
                        disabled={currentExercise.completed_sets >= currentExercise.sets}
                      >
                        Завершить подход
                      </Button>
                      <Button
                        onClick={handleNextExercise}
                        className="w-full"
                        size="lg"
                        variant="outline"
                        disabled={currentExercise.completed_sets < currentExercise.sets}
                      >
                        Следующее упражнение
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Exercise List */}
            <Card>
              <CardHeader>
                <CardTitle>📋 Список упражнений</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workout.exercises.map((exercise, index) => (
                    <div 
                      key={exercise.id}
                      className={`flex items-center p-3 rounded-xl ${
                        index === currentExerciseIndex 
                          ? 'bg-indigo-500/20 border border-indigo-500/50' 
                          : exercise.completed 
                            ? 'bg-emerald-500/10 border border-emerald-500/30' 
                            : 'bg-gray-800'
                      }`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                        {index < currentExerciseIndex ? (
                          <span className="text-emerald-400">✓</span>
                        ) : index === currentExerciseIndex ? (
                          <span className="text-indigo-400 font-bold">{index + 1}</span>
                        ) : (
                          <span className="text-gray-500">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {exercise.exercise.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {exercise.sets} подхода × {exercise.reps} повторений
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {exercise.completed_sets}/{exercise.sets}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}; 