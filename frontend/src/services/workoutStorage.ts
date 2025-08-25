export interface WorkoutSession {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // в минутах
  exercises: {
    name: string;
    sets: number;
    reps?: number;
    duration?: number;
    completed: boolean;
  }[];
  calories: number;
  completed: boolean;
}

export interface UserStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalTime: number; // в минутах
  totalCalories: number;
  lastWorkoutDate: string | null;
  weeklyGoal: number;
  weeklyCompleted: number;
}

class WorkoutStorageService {
  private WORKOUT_HISTORY_KEY = 'workout_history';
  private USER_STATS_KEY = 'user_stats';
  private MAX_HISTORY_ITEMS = 100; // Максимум записей в истории

  // Получить всю историю тренировок
  getWorkoutHistory(): WorkoutSession[] {
    try {
      const history = localStorage.getItem(this.WORKOUT_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting workout history:', error);
      return [];
    }
  }

  // Добавить тренировку в историю
  addWorkoutSession(session: WorkoutSession): void {
    try {
      const history = this.getWorkoutHistory();
      history.unshift(session); // Добавляем в начало
      
      // Ограничиваем размер истории
      if (history.length > this.MAX_HISTORY_ITEMS) {
        history.pop();
      }
      
      localStorage.setItem(this.WORKOUT_HISTORY_KEY, JSON.stringify(history));
      
      // Обновляем статистику
      this.updateStats(session);
    } catch (error) {
      console.error('Error saving workout session:', error);
    }
  }

  // Получить статистику пользователя
  getUserStats(): UserStats {
    try {
      const stats = localStorage.getItem(this.USER_STATS_KEY);
      if (stats) {
        return JSON.parse(stats);
      }
      
      // Дефолтная статистика
      return {
        totalWorkouts: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalTime: 0,
        totalCalories: 0,
        lastWorkoutDate: null,
        weeklyGoal: 5,
        weeklyCompleted: 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return this.getUserStats(); // Возвращаем дефолтную статистику
    }
  }

  // Обновить статистику после тренировки
  private updateStats(session: WorkoutSession): void {
    if (!session.completed) return;
    
    try {
      const stats = this.getUserStats();
      const today = new Date().toISOString().split('T')[0];
      const lastDate = stats.lastWorkoutDate;
      
      // Обновляем общие показатели
      stats.totalWorkouts++;
      stats.totalTime += session.duration;
      stats.totalCalories += session.calories;
      
      // Обновляем streak
      if (lastDate) {
        const lastWorkout = new Date(lastDate);
        const currentWorkout = new Date(today);
        const daysDiff = Math.floor((currentWorkout.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Продолжаем streak
          stats.currentStreak++;
        } else if (daysDiff > 1) {
          // Streak прерван
          stats.currentStreak = 1;
        }
        // Если daysDiff === 0, это вторая тренировка за день, streak не меняется
      } else {
        // Первая тренировка
        stats.currentStreak = 1;
      }
      
      // Обновляем максимальный streak
      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }
      
      // Обновляем недельный прогресс
      const weekStart = this.getWeekStart();
      const sessionDate = new Date(session.date);
      if (sessionDate >= weekStart) {
        const weeklyWorkouts = this.getWorkoutHistory().filter(w => {
          const workoutDate = new Date(w.date);
          return workoutDate >= weekStart && w.completed;
        });
        stats.weeklyCompleted = weeklyWorkouts.length;
      } else {
        // Новая неделя
        stats.weeklyCompleted = 1;
      }
      
      stats.lastWorkoutDate = today;
      
      localStorage.setItem(this.USER_STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  // Получить начало текущей недели
  private getWeekStart(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Понедельник - начало недели
    return new Date(now.setDate(diff));
  }

  // Получить тренировки за последние N дней
  getRecentWorkouts(days: number = 7): WorkoutSession[] {
    const history = this.getWorkoutHistory();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return history.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= cutoffDate;
    });
  }

  // Получить данные для графика
  getChartData(period: 'week' | 'month' | 'year'): number[] {
    const history = this.getWorkoutHistory();
    const now = new Date();
    let data: number[] = [];
    
    switch (period) {
      case 'week':
        // Последние 7 дней
        data = Array(7).fill(0);
        for (let i = 0; i < 7; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() - (6 - i));
          const dateStr = date.toISOString().split('T')[0];
          const count = history.filter(w => w.date === dateStr && w.completed).length;
          data[i] = count;
        }
        break;
        
      case 'month':
        // Последние 4 недели
        data = Array(4).fill(0);
        for (let i = 0; i < 4; i++) {
          const weekStart = new Date(now);
          weekStart.setDate(weekStart.getDate() - (3 - i) * 7);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 7);
          
          const count = history.filter(w => {
            const date = new Date(w.date);
            return date >= weekStart && date < weekEnd && w.completed;
          }).length;
          data[i] = count;
        }
        break;
        
      case 'year':
        // Последние 12 месяцев
        data = Array(12).fill(0);
        for (let i = 0; i < 12; i++) {
          const monthDate = new Date(now);
          monthDate.setMonth(monthDate.getMonth() - (11 - i));
          const month = monthDate.getMonth();
          const year = monthDate.getFullYear();
          
          const count = history.filter(w => {
            const date = new Date(w.date);
            return date.getMonth() === month && date.getFullYear() === year && w.completed;
          }).length;
          data[i] = count;
        }
        break;
    }
    
    return data;
  }

  // Очистить всю историю
  clearHistory(): void {
    localStorage.removeItem(this.WORKOUT_HISTORY_KEY);
    localStorage.removeItem(this.USER_STATS_KEY);
  }

  // Экспорт данных в JSON
  exportData(): string {
    const history = this.getWorkoutHistory();
    const stats = this.getUserStats();
    return JSON.stringify({ history, stats }, null, 2);
  }

  // Импорт данных из JSON
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.history && Array.isArray(data.history)) {
        localStorage.setItem(this.WORKOUT_HISTORY_KEY, JSON.stringify(data.history));
      }
      if (data.stats) {
        localStorage.setItem(this.USER_STATS_KEY, JSON.stringify(data.stats));
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export default new WorkoutStorageService();