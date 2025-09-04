import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import aiService, { UserProfile, Workout } from '../services/aiService';
import { useUser } from '../hooks/useUser';

export const GenerateWorkoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<Workout | null>(null);
  
  // Профиль пользователя для AI
  const [profile, setProfile] = useState<UserProfile>({
    age: 25,
    weight: 70,
    height: 175,
    fitness_level: 'intermediate',
    goals: ['muscle_gain'],
    injuries: [],
    available_equipment: [],
    workout_duration: 45,
    days_per_week: 3
  });

  // Загрузка профиля из localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const fitnessLevels = [
    { id: 'beginner', name: 'Начинающий', icon: '🌱' },
    { id: 'intermediate', name: 'Средний', icon: '💪' },
    { id: 'advanced', name: 'Продвинутый', icon: '🏆' }
  ];

  const goals = [
    { id: 'muscle_gain', name: 'Набор массы', icon: '💪' },
    { id: 'weight_loss', name: 'Похудение', icon: '🔥' },
    { id: 'strength', name: 'Сила', icon: '⚡' },
    { id: 'endurance', name: 'Выносливость', icon: '🏃' }
  ];

  const equipment = [
    { id: 'dumbbells', name: 'Гантели', icon: '🏋️' },
    { id: 'barbell', name: 'Штанга', icon: '🏋️‍♂️' },
    { id: 'kettlebell', name: 'Гиря', icon: '🔔' },
    { id: 'resistance_bands', name: 'Резинки', icon: '🎯' },
    { id: 'pull_up_bar', name: 'Турник', icon: '🚪' },
    { id: 'none', name: 'Без оборудования', icon: '🤸' }
  ];

  const handleProfileUpdate = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGoalToggle = (goalId: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleEquipmentToggle = (equipmentId: string) => {
    if (equipmentId === 'none') {
      setProfile(prev => ({
        ...prev,
        available_equipment: []
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        available_equipment: prev.available_equipment?.includes(equipmentId)
          ? prev.available_equipment.filter(e => e !== equipmentId)
          : [...(prev.available_equipment || []), equipmentId]
      }));
    }
  };

  const handleGenerateWorkout = async () => {
    setLoading(true);
    
    try {
      // Сохраняем профиль
      localStorage.setItem('user_profile', JSON.stringify(profile));
      
      // Генерируем тренировку через AI
      const workout = await aiService.generateWorkout(profile);
      setGeneratedWorkout(workout);
      
      // Сохраняем локально
      aiService.saveWorkoutLocally(workout);
      
    } catch (error) {
      console.error('Error generating workout:', error);
      // Fallback на mock данные при ошибке
      const mockWorkout: Workout = {
        title: 'Тренировка на все тело',
        description: 'Комплексная тренировка для всех групп мышц',
        duration_minutes: profile.workout_duration,
        difficulty: profile.fitness_level,
        exercises: [
          {
            name: 'Отжимания',
            sets: 3,
            reps: '10-12',
            rest_seconds: 60,
            muscle_groups: ['грудь', 'плечи', 'трицепс'],
            notes: 'Держите корпус прямым',
            difficulty: 'medium'
          },
          {
            name: 'Приседания',
            sets: 3,
            reps: '12-15',
            rest_seconds: 60,
            muscle_groups: ['квадрицепс', 'ягодицы'],
            notes: 'Колени не выходят за носки',
            difficulty: 'medium'
          },
          {
            name: 'Планка',
            sets: 3,
            reps: '45 сек',
            rest_seconds: 45,
            muscle_groups: ['пресс', 'кор'],
            notes: 'Не прогибайте спину',
            difficulty: 'medium'
          }
        ],
        warmup: [
          { name: 'Круговые движения руками', duration: '30 сек' },
          { name: 'Махи ногами', duration: '30 сек на каждую' }
        ],
        cooldown: [
          { name: 'Растяжка груди', duration: '30 сек' },
          { name: 'Растяжка ног', duration: '30 сек на каждую' }
        ],
        tips: [
          'Пейте воду во время тренировки',
          'Следите за техникой выполнения',
          'Отдыхайте между подходами'
        ],
        calories_burned: 250
      };
      setGeneratedWorkout(mockWorkout);
      aiService.saveWorkoutLocally(mockWorkout);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = () => {
    if (generatedWorkout) {
      navigate('/workout/generated', { state: { workout: generatedWorkout } });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>📊 Базовая информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Возраст
                </label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => handleProfileUpdate('age', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="25"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Вес (кг)
                  </label>
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => handleProfileUpdate('weight', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="70"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Рост (см)
                  </label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => handleProfileUpdate('height', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="175"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Уровень подготовки
                </label>
                <div className="space-y-2">
                  {fitnessLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => handleProfileUpdate('fitness_level', level.id as any)}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        profile.fitness_level === level.id
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{level.icon}</span>
                        <span className="font-medium text-white">{level.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={() => setStep(2)}
                className="w-full"
                size="lg"
                variant="primary"
              >
                Далее →
              </Button>
            </CardContent>
          </Card>
        );
        
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>🎯 Цели тренировок</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleGoalToggle(goal.id)}
                    className={`p-4 rounded-xl transition-all duration-200 ${
                      profile.goals.includes(goal.id)
                        ? 'bg-indigo-500 shadow-lg shadow-indigo-500/25'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{goal.icon}</div>
                      <div className="text-sm font-medium text-white">{goal.name}</div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Длительность тренировки (минут)
                </label>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={profile.workout_duration}
                  onChange={(e) => handleProfileUpdate('workout_duration', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-white mt-2">{profile.workout_duration} минут</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Тренировок в неделю
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={profile.days_per_week}
                  onChange={(e) => handleProfileUpdate('days_per_week', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-white mt-2">{profile.days_per_week} дней</div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => setStep(1)}
                  className="flex-1"
                  variant="secondary"
                >
                  ← Назад
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1"
                  variant="primary"
                  disabled={profile.goals.length === 0}
                >
                  Далее →
                </Button>
              </div>
            </CardContent>
          </Card>
        );
        
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>🏋️ Доступное оборудование</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {equipment.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleEquipmentToggle(item.id)}
                    className={`p-4 rounded-xl transition-all duration-200 ${
                      (item.id === 'none' && (!profile.available_equipment || profile.available_equipment.length === 0)) ||
                      (profile.available_equipment?.includes(item.id))
                        ? 'bg-indigo-500 shadow-lg shadow-indigo-500/25'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-xs font-medium text-white">{item.name}</div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => setStep(2)}
                  className="flex-1"
                  variant="secondary"
                >
                  ← Назад
                </Button>
                <Button
                  onClick={handleGenerateWorkout}
                  className="flex-1"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Генерация...</span>
                    </div>
                  ) : (
                    '🎯 Создать тренировку'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4 pb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            AI Генератор тренировок
          </h1>
          <p className="text-gray-400">
            Персональная программа за 30 секунд
          </p>
          
          {/* Progress Steps */}
          <div className="flex justify-center space-x-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-1 rounded-full transition-all ${
                  s <= step ? 'bg-indigo-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Current Step */}
        {!generatedWorkout && renderStep()}

        {/* Generated Workout */}
        {generatedWorkout && (
          <Card className="slide-up">
            <CardHeader>
              <CardTitle>✅ Тренировка создана!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">{generatedWorkout.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{generatedWorkout.description}</p>
                <div className="flex justify-between text-sm">
                  <div className="text-gray-400">
                    <span className="text-indigo-400">⏱️</span> {generatedWorkout.duration_minutes} мин
                  </div>
                  <div className="text-gray-400">
                    <span className="text-orange-400">🔥</span> {generatedWorkout.calories_burned} ккал
                  </div>
                  <div className="text-gray-400">
                    <span className="text-green-400">💪</span> {generatedWorkout.exercises.length} упр.
                  </div>
                </div>
              </div>

              {/* Warmup */}
              <div>
                <h4 className="font-medium text-white mb-2">🔥 Разминка</h4>
                <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                  {generatedWorkout.warmup.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-300">{item.name}</span>
                      <span className="text-gray-500">{item.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exercises */}
              <div>
                <h4 className="font-medium text-white mb-2">💪 Упражнения</h4>
                <div className="space-y-2">
                  {generatedWorkout.exercises.map((exercise, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-white">{exercise.name}</div>
                          <div className="text-xs text-gray-400">
                            {exercise.muscle_groups.join(', ')}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-indigo-400">
                            {exercise.sets} × {exercise.reps}
                          </div>
                          <div className="text-gray-500 text-xs">
                            Отдых: {exercise.rest_seconds}с
                          </div>
                        </div>
                      </div>
                      {exercise.notes && (
                        <div className="text-xs text-gray-500 italic">
                          💡 {exercise.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div>
                <h4 className="font-medium text-white mb-2">💡 Советы</h4>
                <div className="bg-gray-800 rounded-lg p-3 space-y-1">
                  {generatedWorkout.tips.map((tip, index) => (
                    <div key={index} className="text-sm text-gray-400">
                      • {tip}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    setGeneratedWorkout(null);
                    setStep(1);
                  }}
                  className="flex-1"
                  variant="secondary"
                >
                  🔄 Новая
                </Button>
                <Button
                  onClick={handleStartWorkout}
                  className="flex-1"
                  variant="success"
                >
                  🏋️ Начать
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};