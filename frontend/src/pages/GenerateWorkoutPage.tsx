import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface WorkoutType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface MuscleGroup {
  id: string;
  name: string;
  icon: string;
}

export const GenerateWorkoutPage: React.FC = () => {
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('strength');
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);

  const workoutTypes: WorkoutType[] = [
    {
      id: 'strength',
      name: 'Силовая тренировка',
      description: 'Фокус на силе и мышечной массе',
      icon: '💪'
    },
    {
      id: 'cardio',
      name: 'Кардио тренировка',
      description: 'Улучшение выносливости',
      icon: '❤️'
    },
    {
      id: 'flexibility',
      name: 'Растяжка',
      description: 'Гибкость и мобильность',
      icon: '🧘'
    },
    {
      id: 'hiit',
      name: 'HIIT',
      description: 'Высокоинтенсивные интервалы',
      icon: '⚡'
    }
  ];

  const muscleGroups: MuscleGroup[] = [
    { id: 'chest', name: 'Грудь', icon: '🏋️' },
    { id: 'back', name: 'Спина', icon: '💪' },
    { id: 'legs', name: 'Ноги', icon: '🦵' },
    { id: 'shoulders', name: 'Плечи', icon: '🏃' },
    { id: 'arms', name: 'Руки', icon: '💪' },
    { id: 'core', name: 'Пресс', icon: '🔥' }
  ];

  const handleMuscleGroupToggle = (muscleGroupId: string) => {
    setSelectedMuscleGroups(prev => 
      prev.includes(muscleGroupId)
        ? prev.filter(id => id !== muscleGroupId)
        : [...prev, muscleGroupId]
    );
  };

  const handleGenerateWorkout = async () => {
    if (selectedMuscleGroups.length === 0) {
      alert('Выберите хотя бы одну группу мышц');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const mockWorkout = {
        id: 1,
        name: `${workoutTypes.find(t => t.id === selectedWorkoutType)?.name} - ${selectedMuscleGroups.length} групп`,
        workout_type: selectedWorkoutType,
        duration_minutes: 45,
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
              name: 'Приседания',
              muscle_group: 'legs',
              description: 'Приседания для проработки мышц ног',
              is_active: true,
              created_at: new Date().toISOString()
            },
            weight: undefined,
            duration_seconds: undefined
          }
        ]
      };

      setGeneratedWorkout(mockWorkout);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4 pb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Создать тренировку
          </h1>
          <p className="text-gray-400">
            Выберите тип тренировки и группы мышц
          </p>
        </div>

        {/* Workout Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>🏋️ Тип тренировки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workoutTypes.map((type) => (
                <div
                  key={type.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedWorkoutType === type.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedWorkoutType(type.id)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-white">{type.name}</div>
                      <div className="text-sm text-gray-400">{type.description}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedWorkoutType === type.id
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-600'
                    }`}>
                      {selectedWorkoutType === type.id && (
                        <div className="w-full h-full rounded-full bg-white scale-75"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Muscle Groups Selection */}
        <Card>
          <CardHeader>
            <CardTitle>💪 Группы мышц</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {muscleGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleMuscleGroupToggle(group.id)}
                  className={`p-4 rounded-xl transition-all duration-200 ${
                    selectedMuscleGroups.includes(group.id)
                      ? 'bg-indigo-500 shadow-lg shadow-indigo-500/25'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{group.icon}</div>
                    <div className="text-sm font-medium text-white">{group.name}</div>
                  </div>
                </button>
              ))}
            </div>
            {selectedMuscleGroups.length === 0 && (
              <p className="text-rose-400 text-sm mt-3">
                Выберите хотя бы одну группу мышц
              </p>
            )}
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateWorkout}
          className="w-full"
          size="lg"
          variant="primary"
          disabled={loading || selectedMuscleGroups.length === 0}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Создание тренировки...</span>
            </div>
          ) : (
            '🎯 Создать тренировку'
          )}
        </Button>

        {/* Generated Workout */}
        {generatedWorkout && (
          <Card className="slide-up">
            <CardHeader>
              <CardTitle>✅ Тренировка создана!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">{generatedWorkout.name}</h3>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>⏱️ Длительность: {generatedWorkout.duration_minutes} минут</div>
                  <div>💪 Упражнений: {generatedWorkout.exercises.length}</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-white">Упражнения:</h4>
                {generatedWorkout.exercises.map((exercise: any, index: number) => (
                  <div key={exercise.id} className="bg-gray-800 rounded-xl p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center">
                        <span className="text-indigo-400 font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{exercise.exercise.name}</div>
                        <div className="text-sm text-gray-400">
                          {exercise.sets} подхода × {exercise.reps} повторений
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => window.history.pushState({}, '', '/workout')}
                className="w-full"
                size="lg"
                variant="success"
              >
                🏋️ Начать тренировку
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}; 