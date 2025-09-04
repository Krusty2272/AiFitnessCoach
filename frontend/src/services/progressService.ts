import api from './api';

export interface WorkoutSession {
  id?: number;
  workout_type: string;
  workout_name: string;
  exercises: any[];
  duration_minutes?: number;
  calories_burned?: number;
  difficulty_rating?: number;
  enjoyment_rating?: number;
  notes?: string;
  started_at?: string;
  completed_at?: string;
  is_ai_generated?: boolean;
}

export interface ExerciseLog {
  workout_id?: number;
  name: string;
  muscle_groups: string[];
  equipment?: string;
  sets_completed: number;
  sets_planned: number;
  reps: number[];
  weight?: number[];
  duration_seconds?: number;
}

export interface StatsOverview {
  total_workouts: number;
  total_minutes: number;
  total_calories: number;
  current_streak: number;
  level: number;
  experience: number;
  next_level_exp: number;
  stats_30d: {
    workouts: number;
    minutes: number;
    calories: number;
  };
  favorite_exercises: Array<{
    name: string;
    count: number;
  }>;
  recent_workouts: Array<{
    id: number;
    name: string;
    date: string;
    duration: number;
    calories: number;
  }>;
}

export interface ChartData {
  labels: string[];
  datasets: {
    workouts: number[];
    minutes: number[];
    calories: number[];
  };
  totals: {
    workouts: number;
    minutes: number;
    calories: number;
  };
}

export interface BodyMetrics {
  weight: number;
  body_fat?: number;
  muscle_mass?: number;
  bmi?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps_left?: number;
  biceps_right?: number;
  thigh_left?: number;
  thigh_right?: number;
}

export interface Milestone {
  id: number;
  type: string;
  name: string;
  value: number;
  previous_value?: number;
  achieved_at: string;
}

class ProgressService {
  private activeWorkout: WorkoutSession | null = null;
  private workoutStartTime: Date | null = null;

  // Начать тренировку
  async startWorkout(workout: Partial<WorkoutSession>): Promise<number> {
    try {
      const response = await api.post('/api/v1/progress/workout/start', {
        type: workout.workout_type || 'general',
        name: workout.workout_name || 'Тренировка',
        exercises: workout.exercises || [],
        is_ai_generated: workout.is_ai_generated || false
      });

      this.activeWorkout = {
        ...workout,
        id: response.data.workout_id,
        started_at: response.data.started_at
      } as WorkoutSession;
      
      this.workoutStartTime = new Date();
      
      // Сохраняем в localStorage для восстановления
      this.saveActiveWorkout();
      
      return response.data.workout_id;
    } catch (error) {
      console.error('Error starting workout:', error);
      throw error;
    }
  }

  // Завершить тренировку
  async completeWorkout(completionData: Partial<WorkoutSession>): Promise<any> {
    if (!this.activeWorkout?.id) {
      throw new Error('No active workout');
    }

    try {
      const duration = this.workoutStartTime 
        ? Math.floor((Date.now() - this.workoutStartTime.getTime()) / 60000)
        : completionData.duration_minutes || 0;

      const response = await api.post(`/api/v1/progress/workout/${this.activeWorkout.id}/complete`, {
        duration_minutes: duration,
        calories_burned: completionData.calories_burned || this.estimateCalories(duration),
        completed_exercises: completionData.exercises?.length || 0,
        difficulty_rating: completionData.difficulty_rating,
        enjoyment_rating: completionData.enjoyment_rating,
        notes: completionData.notes
      });

      // Очищаем активную тренировку
      this.clearActiveWorkout();

      return response.data;
    } catch (error) {
      console.error('Error completing workout:', error);
      throw error;
    }
  }

  // Записать выполнение упражнения
  async logExercise(exercise: ExerciseLog): Promise<void> {
    try {
      await api.post('/api/v1/progress/exercise/log', {
        ...exercise,
        workout_id: this.activeWorkout?.id
      });
    } catch (error) {
      console.error('Error logging exercise:', error);
      throw error;
    }
  }

  // Получить статистику
  async getStatsOverview(): Promise<StatsOverview> {
    try {
      const response = await api.get('/api/v1/progress/stats/overview');
      return response.data;
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }

  // Получить данные для графиков
  async getChartData(period: 'week' | 'month' | 'year'): Promise<ChartData> {
    try {
      const response = await api.get(`/api/v1/progress/stats/chart/${period}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chart data:', error);
      throw error;
    }
  }

  // Получить достижения
  async getMilestones(): Promise<Milestone[]> {
    try {
      const response = await api.get('/api/v1/progress/milestones');
      return response.data;
    } catch (error) {
      console.error('Error getting milestones:', error);
      return [];
    }
  }

  // Добавить замеры тела
  async addBodyMetrics(metrics: BodyMetrics): Promise<void> {
    try {
      await api.post('/api/v1/progress/body-metrics', metrics);
    } catch (error) {
      console.error('Error adding body metrics:', error);
      throw error;
    }
  }

  // Получить историю замеров
  async getBodyMetricsHistory(): Promise<any[]> {
    try {
      const response = await api.get('/api/v1/progress/body-metrics/history');
      return response.data;
    } catch (error) {
      console.error('Error getting body metrics history:', error);
      return [];
    }
  }

  // Управление активной тренировкой
  getActiveWorkout(): WorkoutSession | null {
    if (this.activeWorkout) return this.activeWorkout;
    
    // Пробуем восстановить из localStorage
    const saved = localStorage.getItem('active_workout');
    if (saved) {
      try {
        const workout = JSON.parse(saved);
        this.activeWorkout = workout;
        this.workoutStartTime = new Date(workout.started_at);
        return workout;
      } catch {
        return null;
      }
    }
    
    return null;
  }

  private saveActiveWorkout() {
    if (this.activeWorkout) {
      localStorage.setItem('active_workout', JSON.stringify(this.activeWorkout));
      localStorage.setItem('workout_start_time', this.workoutStartTime?.toISOString() || '');
    }
  }

  private clearActiveWorkout() {
    this.activeWorkout = null;
    this.workoutStartTime = null;
    localStorage.removeItem('active_workout');
    localStorage.removeItem('workout_start_time');
  }

  // Оценка калорий
  private estimateCalories(minutes: number): number {
    // Примерная оценка: 7-10 калорий в минуту для средней интенсивности
    return Math.round(minutes * 8);
  }

  // Получить текущий прогресс уровня
  getLevelProgress(experience: number, level: number): number {
    const currentLevelExp = experience;
    const nextLevelExp = level * 100;
    return Math.min((currentLevelExp / nextLevelExp) * 100, 100);
  }

  // Форматирование времени тренировки
  formatWorkoutDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins} мин`;
  }

  // Расчет среднего времени тренировки
  calculateAverageWorkoutTime(totalMinutes: number, totalWorkouts: number): number {
    if (totalWorkouts === 0) return 0;
    return Math.round(totalMinutes / totalWorkouts);
  }

  // Определение тренда прогресса
  calculateProgressTrend(currentWeek: number, previousWeek: number): {
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  } {
    if (previousWeek === 0) {
      return { trend: 'up', percentage: 100 };
    }
    
    const change = ((currentWeek - previousWeek) / previousWeek) * 100;
    
    if (change > 5) return { trend: 'up', percentage: Math.round(change) };
    if (change < -5) return { trend: 'down', percentage: Math.round(Math.abs(change)) };
    return { trend: 'stable', percentage: 0 };
  }
}

export default new ProgressService();