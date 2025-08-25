// User types
export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  fitness_goal?: string;
  experience_level?: string;
  weight?: number;
  height?: number;
  age?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserCreate {
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface UserUpdate {
  fitness_goal?: string;
  experience_level?: string;
  weight?: number;
  height?: number;
  age?: number;
}

// Exercise types
export interface Exercise {
  id: number;
  name: string;
  description?: string;
  muscle_group?: string;
  equipment?: string;
  difficulty?: string;
  is_active: boolean;
  created_at: string;
}

// Workout types
export interface WorkoutExercise {
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

export interface Workout {
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

export interface WorkoutCreate {
  name: string;
  workout_type?: string;
  duration_minutes?: number;
  exercises: WorkoutExerciseCreate[];
}

export interface WorkoutExerciseCreate {
  exercise_id: number;
  sets: number;
  reps: number;
  weight?: number;
  duration_seconds?: number;
  rest_seconds: number;
  order: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// App state types
export interface AppState {
  user: User | null;
  currentWorkout: Workout | null;
  isLoading: boolean;
  error: string | null;
}

// Navigation types
export type AppRoute = 
  | '/'
  | '/onboarding'
  | '/profile'
  | '/exercises'
  | '/workouts'
  | '/workout/:id'
  | '/generate';

// Fitness goal options
export const FITNESS_GOALS = [
  { value: 'weight_loss', label: 'Похудение' },
  { value: 'muscle_gain', label: 'Набор мышечной массы' },
  { value: 'strength', label: 'Развитие силы' },
  { value: 'endurance', label: 'Выносливость' },
] as const;

// Experience level options
export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Новичок' },
  { value: 'intermediate', label: 'Средний уровень' },
  { value: 'advanced', label: 'Продвинутый' },
] as const;

// Muscle groups
export const MUSCLE_GROUPS = [
  { value: 'chest', label: 'Грудь' },
  { value: 'back', label: 'Спина' },
  { value: 'legs', label: 'Ноги' },
  { value: 'shoulders', label: 'Плечи' },
  { value: 'arms', label: 'Руки' },
  { value: 'core', label: 'Пресс' },
] as const;

// Equipment types
export const EQUIPMENT_TYPES = [
  { value: 'bodyweight', label: 'Собственный вес' },
  { value: 'dumbbell', label: 'Гантели' },
  { value: 'barbell', label: 'Штанга' },
  { value: 'machine', label: 'Тренажер' },
] as const; 