const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface User {
  id?: number;
  telegram_id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  fitness_goal?: string;
  experience_level?: string;
  weight?: number;
  height?: number;
  age?: number;
}

interface Workout {
  id?: number;
  name: string;
  description?: string;
  exercises: Exercise[];
  difficulty?: string;
  duration?: number;
}

interface Exercise {
  id?: number;
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  rest?: number;
  description?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || response.statusText);
      }

      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Mock user для тестирования без авторизации
  async getMockUser(): Promise<User> {
    return {
      id: 1,
      username: 'test_user',
      first_name: 'Test',
      last_name: 'User',
      fitness_goal: 'muscle_gain',
      experience_level: 'intermediate',
      weight: 75,
      height: 180,
      age: 25
    };
  }

  // User endpoints
  async createUser(userData: User) {
    return this.request<User>('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUser(telegramId: number) {
    return this.request<User>(`/users/${telegramId}`);
  }

  async updateUser(telegramId: number, userData: Partial<User>) {
    return this.request<User>(`/users/${telegramId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Workout endpoints
  async getWorkouts() {
    return this.request<Workout[]>('/workouts/');
  }

  async getWorkout(id: number) {
    return this.request<Workout>(`/workouts/${id}`);
  }

  async createWorkout(workoutData: Workout) {
    return this.request<Workout>('/workouts/', {
      method: 'POST',
      body: JSON.stringify(workoutData),
    });
  }

  async generateWorkout(params: {
    goal: string;
    level: string;
    duration?: number;
    equipment?: string[];
  }) {
    return this.request<Workout>('/workouts/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Health check
  async health() {
    const response = await fetch(`${API_URL.replace('/api/v1', '')}/health`);
    return response.ok;
  }
}

export default new ApiService();
export type { User, Workout, Exercise };