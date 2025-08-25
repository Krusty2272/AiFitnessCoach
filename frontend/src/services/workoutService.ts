import apiClient from './api';
import { Workout, WorkoutCreate, Exercise } from '../types';

export class WorkoutService {
  static async getUserWorkouts(telegramId: number, limit = 10, offset = 0): Promise<Workout[]> {
    const response = await apiClient.get('/api/v1/workouts/', {
      params: { telegram_id: telegramId, limit, offset }
    });
    return response.data;
  }

  static async getWorkout(workoutId: number): Promise<Workout> {
    const response = await apiClient.get(`/api/v1/workouts/${workoutId}`);
    return response.data;
  }

  static async createWorkout(telegramId: number, workoutData: WorkoutCreate): Promise<Workout> {
    const response = await apiClient.post('/api/v1/workouts/', workoutData, {
      params: { telegram_id: telegramId }
    });
    return response.data;
  }

  static async updateWorkout(workoutId: number, workoutData: Partial<WorkoutCreate>): Promise<Workout> {
    const response = await apiClient.put(`/api/v1/workouts/${workoutId}`, workoutData);
    return response.data;
  }

  static async completeWorkout(workoutId: number): Promise<Workout> {
    const response = await apiClient.post(`/api/v1/workouts/${workoutId}/complete`);
    return response.data;
  }

  static async generateWorkout(
    telegramId: number,
    workoutType = 'strength',
    muscleGroups: string[] = ['chest', 'back']
  ): Promise<Workout> {
    const response = await apiClient.post('/api/v1/workouts/generate/', null, {
      params: {
        telegram_id: telegramId,
        workout_type: workoutType,
        muscle_groups: muscleGroups
      }
    });
    return response.data;
  }

  static async getExercises(
    muscleGroup?: string,
    equipment?: string,
    difficulty?: string,
    limit = 50,
    offset = 0
  ): Promise<Exercise[]> {
    const response = await apiClient.get('/api/v1/workouts/exercises/', {
      params: { muscle_group: muscleGroup, equipment, difficulty, limit, offset }
    });
    return response.data;
  }
} 