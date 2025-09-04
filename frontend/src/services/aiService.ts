import api from './api';

export interface UserProfile {
  age: number;
  weight: number;
  height: number;
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  injuries?: string[];
  available_equipment?: string[];
  workout_duration: number;
  days_per_week: number;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  muscle_groups: string[];
  equipment?: string;
  notes?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Workout {
  title: string;
  description: string;
  duration_minutes: number;
  difficulty: string;
  exercises: Exercise[];
  warmup: Array<{ name: string; duration: string }>;
  cooldown: Array<{ name: string; duration: string }>;
  tips: string[];
  calories_burned: number;
}

export interface MealPlan {
  daily_calories: number;
  meals: Array<{
    name: string;
    calories: number;
    items: string[];
  }>;
  macros: {
    protein: string;
    carbs: string;
    fats: string;
  };
  water: string;
}

class AIService {
  async generateWorkout(profile: UserProfile): Promise<Workout> {
    try {
      const response = await api.post('/api/v1/ai/generate-workout', profile);
      return response.data;
    } catch (error) {
      console.error('Error generating workout:', error);
      throw error;
    }
  }

  async generateMealPlan(profile: UserProfile): Promise<MealPlan> {
    try {
      const response = await api.post('/api/v1/ai/generate-meal-plan', profile);
      return response.data;
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw error;
    }
  }

  async getWorkoutTemplates(level: 'beginner' | 'intermediate' | 'advanced') {
    try {
      const response = await api.get(`/api/v1/ai/workout-templates/${level}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workout templates:', error);
      throw error;
    }
  }

  async saveWorkout(workout: Workout, userId: number) {
    try {
      const response = await api.post('/api/v1/ai/save-workout', {
        workout,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    }
  }

  async analyzeForm(exerciseName: string, videoUrl?: string, description?: string) {
    try {
      const response = await api.post('/api/v1/ai/analyze-form', {
        exercise_name: exerciseName,
        video_url: videoUrl,
        description
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing form:', error);
      throw error;
    }
  }

  // Локальное сохранение для офлайн режима
  saveWorkoutLocally(workout: Workout) {
    const savedWorkouts = this.getLocalWorkouts();
    savedWorkouts.push({
      ...workout,
      id: Date.now(),
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('saved_workouts', JSON.stringify(savedWorkouts));
  }

  getLocalWorkouts() {
    const saved = localStorage.getItem('saved_workouts');
    return saved ? JSON.parse(saved) : [];
  }

  deleteLocalWorkout(workoutId: number) {
    const workouts = this.getLocalWorkouts();
    const filtered = workouts.filter((w: any) => w.id !== workoutId);
    localStorage.setItem('saved_workouts', JSON.stringify(filtered));
  }

  // Рекомендации на основе истории
  getRecommendations(userHistory: any[]) {
    // Анализ истории тренировок для персональных рекомендаций
    const muscleGroups = userHistory.flatMap(w => 
      w.exercises?.flatMap((e: Exercise) => e.muscle_groups) || []
    );
    
    const groupCount = muscleGroups.reduce((acc: any, group: string) => {
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});

    // Находим менее тренированные группы мышц
    const undertrainedGroups = Object.entries(groupCount)
      .sort(([, a]: any, [, b]: any) => a - b)
      .slice(0, 3)
      .map(([group]) => group);

    return {
      focus_areas: undertrainedGroups,
      recommended_intensity: this.calculateRecommendedIntensity(userHistory),
      next_workout_type: this.getNextWorkoutType(userHistory)
    };
  }

  private calculateRecommendedIntensity(history: any[]) {
    if (history.length < 3) return 'beginner';
    if (history.length < 10) return 'intermediate';
    return 'advanced';
  }

  private getNextWorkoutType(history: any[]) {
    const lastWorkout = history[history.length - 1];
    if (!lastWorkout) return 'full_body';
    
    // Простая логика ротации
    const types = ['upper_body', 'lower_body', 'cardio', 'full_body'];
    const lastType = lastWorkout.type || 'full_body';
    const lastIndex = types.indexOf(lastType);
    return types[(lastIndex + 1) % types.length];
  }
}

export default new AIService();