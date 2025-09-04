import telegramService from './telegramService';

export interface CloudData {
  profile?: {
    age: number;
    weight: number;
    height: number;
    fitness_level: string;
    goals: string[];
  };
  workouts?: Array<{
    id: string;
    name: string;
    date: string;
    duration: number;
    exercises: any[];
  }>;
  progress?: {
    level: number;
    experience: number;
    streak: number;
    total_workouts: number;
    total_minutes: number;
  };
  preferences?: {
    theme: string;
    notifications: boolean;
    language: string;
    units: 'metric' | 'imperial';
  };
  lastSync?: string;
}

class CloudStorageService {
  private readonly STORAGE_KEYS = {
    PROFILE: 'user_profile',
    WORKOUTS: 'workouts_history',
    PROGRESS: 'user_progress',
    PREFERENCES: 'user_preferences',
    LAST_SYNC: 'last_sync'
  };

  private syncInProgress = false;
  private localCache: Map<string, any> = new Map();

  constructor() {
    // Инициализируем кэш из localStorage при запуске
    this.loadLocalCache();
  }

  // Сохранение профиля пользователя
  async saveProfile(profile: CloudData['profile']): Promise<boolean> {
    try {
      const data = JSON.stringify(profile);
      
      // Сохраняем в Telegram Cloud Storage
      if (telegramService.isTelegramWebApp()) {
        await telegramService.saveToCloud(this.STORAGE_KEYS.PROFILE, data);
      }
      
      // Дублируем в localStorage для офлайн доступа
      localStorage.setItem(this.STORAGE_KEYS.PROFILE, data);
      this.localCache.set(this.STORAGE_KEYS.PROFILE, profile);
      
      await this.updateSyncTime();
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  }

  // Получение профиля
  async getProfile(): Promise<CloudData['profile'] | null> {
    try {
      // Сначала проверяем кэш
      if (this.localCache.has(this.STORAGE_KEYS.PROFILE)) {
        return this.localCache.get(this.STORAGE_KEYS.PROFILE);
      }

      let data: string | null = null;

      // Пробуем получить из Telegram Cloud
      if (telegramService.isTelegramWebApp()) {
        data = await telegramService.getFromCloud(this.STORAGE_KEYS.PROFILE);
      }

      // Если нет в облаке, берем из localStorage
      if (!data) {
        data = localStorage.getItem(this.STORAGE_KEYS.PROFILE);
      }

      if (data) {
        const profile = JSON.parse(data);
        this.localCache.set(this.STORAGE_KEYS.PROFILE, profile);
        return profile;
      }

      return null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  // Сохранение истории тренировок
  async saveWorkouts(workouts: CloudData['workouts']): Promise<boolean> {
    try {
      // Ограничиваем размер истории (последние 100 тренировок)
      const limitedWorkouts = workouts?.slice(-100);
      const data = JSON.stringify(limitedWorkouts);
      
      if (telegramService.isTelegramWebApp()) {
        await telegramService.saveToCloud(this.STORAGE_KEYS.WORKOUTS, data);
      }
      
      localStorage.setItem(this.STORAGE_KEYS.WORKOUTS, data);
      this.localCache.set(this.STORAGE_KEYS.WORKOUTS, limitedWorkouts);
      
      await this.updateSyncTime();
      return true;
    } catch (error) {
      console.error('Error saving workouts:', error);
      return false;
    }
  }

  // Получение истории тренировок
  async getWorkouts(): Promise<CloudData['workouts'] | null> {
    try {
      if (this.localCache.has(this.STORAGE_KEYS.WORKOUTS)) {
        return this.localCache.get(this.STORAGE_KEYS.WORKOUTS);
      }

      let data: string | null = null;

      if (telegramService.isTelegramWebApp()) {
        data = await telegramService.getFromCloud(this.STORAGE_KEYS.WORKOUTS);
      }

      if (!data) {
        data = localStorage.getItem(this.STORAGE_KEYS.WORKOUTS);
      }

      if (data) {
        const workouts = JSON.parse(data);
        this.localCache.set(this.STORAGE_KEYS.WORKOUTS, workouts);
        return workouts;
      }

      return null;
    } catch (error) {
      console.error('Error getting workouts:', error);
      return null;
    }
  }

  // Сохранение прогресса
  async saveProgress(progress: CloudData['progress']): Promise<boolean> {
    try {
      const data = JSON.stringify(progress);
      
      if (telegramService.isTelegramWebApp()) {
        await telegramService.saveToCloud(this.STORAGE_KEYS.PROGRESS, data);
      }
      
      localStorage.setItem(this.STORAGE_KEYS.PROGRESS, data);
      this.localCache.set(this.STORAGE_KEYS.PROGRESS, progress);
      
      await this.updateSyncTime();
      return true;
    } catch (error) {
      console.error('Error saving progress:', error);
      return false;
    }
  }

  // Получение прогресса
  async getProgress(): Promise<CloudData['progress'] | null> {
    try {
      if (this.localCache.has(this.STORAGE_KEYS.PROGRESS)) {
        return this.localCache.get(this.STORAGE_KEYS.PROGRESS);
      }

      let data: string | null = null;

      if (telegramService.isTelegramWebApp()) {
        data = await telegramService.getFromCloud(this.STORAGE_KEYS.PROGRESS);
      }

      if (!data) {
        data = localStorage.getItem(this.STORAGE_KEYS.PROGRESS);
      }

      if (data) {
        const progress = JSON.parse(data);
        this.localCache.set(this.STORAGE_KEYS.PROGRESS, progress);
        return progress;
      }

      return null;
    } catch (error) {
      console.error('Error getting progress:', error);
      return null;
    }
  }

  // Сохранение настроек
  async savePreferences(preferences: CloudData['preferences']): Promise<boolean> {
    try {
      const data = JSON.stringify(preferences);
      
      if (telegramService.isTelegramWebApp()) {
        await telegramService.saveToCloud(this.STORAGE_KEYS.PREFERENCES, data);
      }
      
      localStorage.setItem(this.STORAGE_KEYS.PREFERENCES, data);
      this.localCache.set(this.STORAGE_KEYS.PREFERENCES, preferences);
      
      // Применяем настройки сразу
      this.applyPreferences(preferences);
      
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  }

  // Получение настроек
  async getPreferences(): Promise<CloudData['preferences'] | null> {
    try {
      if (this.localCache.has(this.STORAGE_KEYS.PREFERENCES)) {
        return this.localCache.get(this.STORAGE_KEYS.PREFERENCES);
      }

      let data: string | null = null;

      if (telegramService.isTelegramWebApp()) {
        data = await telegramService.getFromCloud(this.STORAGE_KEYS.PREFERENCES);
      }

      if (!data) {
        data = localStorage.getItem(this.STORAGE_KEYS.PREFERENCES);
      }

      if (data) {
        const preferences = JSON.parse(data);
        this.localCache.set(this.STORAGE_KEYS.PREFERENCES, preferences);
        this.applyPreferences(preferences);
        return preferences;
      }

      // Настройки по умолчанию
      const defaultPreferences: CloudData['preferences'] = {
        theme: 'dark',
        notifications: true,
        language: 'ru',
        units: 'metric'
      };

      await this.savePreferences(defaultPreferences);
      return defaultPreferences;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return null;
    }
  }

  // Полная синхронизация всех данных
  async syncAll(): Promise<boolean> {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return false;
    }

    this.syncInProgress = true;

    try {
      const tasks = [];

      // Загружаем все данные из localStorage
      const profile = localStorage.getItem(this.STORAGE_KEYS.PROFILE);
      const workouts = localStorage.getItem(this.STORAGE_KEYS.WORKOUTS);
      const progress = localStorage.getItem(this.STORAGE_KEYS.PROGRESS);
      const preferences = localStorage.getItem(this.STORAGE_KEYS.PREFERENCES);

      // Синхронизируем с облаком
      if (telegramService.isTelegramWebApp()) {
        if (profile) {
          tasks.push(telegramService.saveToCloud(this.STORAGE_KEYS.PROFILE, profile));
        }
        if (workouts) {
          tasks.push(telegramService.saveToCloud(this.STORAGE_KEYS.WORKOUTS, workouts));
        }
        if (progress) {
          tasks.push(telegramService.saveToCloud(this.STORAGE_KEYS.PROGRESS, progress));
        }
        if (preferences) {
          tasks.push(telegramService.saveToCloud(this.STORAGE_KEYS.PREFERENCES, preferences));
        }

        await Promise.all(tasks);
        await this.updateSyncTime();
      }

      return true;
    } catch (error) {
      console.error('Error syncing data:', error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Загрузка всех данных из облака
  async loadFromCloud(): Promise<boolean> {
    if (!telegramService.isTelegramWebApp()) {
      return false;
    }

    try {
      const [profile, workouts, progress, preferences] = await Promise.all([
        telegramService.getFromCloud(this.STORAGE_KEYS.PROFILE),
        telegramService.getFromCloud(this.STORAGE_KEYS.WORKOUTS),
        telegramService.getFromCloud(this.STORAGE_KEYS.PROGRESS),
        telegramService.getFromCloud(this.STORAGE_KEYS.PREFERENCES)
      ]);

      // Сохраняем в localStorage и кэш
      if (profile) {
        localStorage.setItem(this.STORAGE_KEYS.PROFILE, profile);
        this.localCache.set(this.STORAGE_KEYS.PROFILE, JSON.parse(profile));
      }
      if (workouts) {
        localStorage.setItem(this.STORAGE_KEYS.WORKOUTS, workouts);
        this.localCache.set(this.STORAGE_KEYS.WORKOUTS, JSON.parse(workouts));
      }
      if (progress) {
        localStorage.setItem(this.STORAGE_KEYS.PROGRESS, progress);
        this.localCache.set(this.STORAGE_KEYS.PROGRESS, JSON.parse(progress));
      }
      if (preferences) {
        localStorage.setItem(this.STORAGE_KEYS.PREFERENCES, preferences);
        const prefs = JSON.parse(preferences);
        this.localCache.set(this.STORAGE_KEYS.PREFERENCES, prefs);
        this.applyPreferences(prefs);
      }

      return true;
    } catch (error) {
      console.error('Error loading from cloud:', error);
      return false;
    }
  }

  // Очистка всех данных
  async clearAll(): Promise<boolean> {
    try {
      // Очищаем облако
      if (telegramService.isTelegramWebApp()) {
        await Promise.all([
          telegramService.removeFromCloud(this.STORAGE_KEYS.PROFILE),
          telegramService.removeFromCloud(this.STORAGE_KEYS.WORKOUTS),
          telegramService.removeFromCloud(this.STORAGE_KEYS.PROGRESS),
          telegramService.removeFromCloud(this.STORAGE_KEYS.PREFERENCES),
          telegramService.removeFromCloud(this.STORAGE_KEYS.LAST_SYNC)
        ]);
      }

      // Очищаем localStorage
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });

      // Очищаем кэш
      this.localCache.clear();

      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  // Проверка времени последней синхронизации
  async getLastSyncTime(): Promise<Date | null> {
    try {
      let syncTime: string | null = null;

      if (telegramService.isTelegramWebApp()) {
        syncTime = await telegramService.getFromCloud(this.STORAGE_KEYS.LAST_SYNC);
      }

      if (!syncTime) {
        syncTime = localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC);
      }

      return syncTime ? new Date(syncTime) : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  // Обновление времени синхронизации
  private async updateSyncTime(): Promise<void> {
    const now = new Date().toISOString();
    
    if (telegramService.isTelegramWebApp()) {
      await telegramService.saveToCloud(this.STORAGE_KEYS.LAST_SYNC, now);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, now);
  }

  // Загрузка кэша из localStorage
  private loadLocalCache(): void {
    Object.entries(this.STORAGE_KEYS).forEach(([key, storageKey]) => {
      const data = localStorage.getItem(storageKey);
      if (data && key !== 'LAST_SYNC') {
        try {
          this.localCache.set(storageKey, JSON.parse(data));
        } catch {
          // Ignore parse errors
        }
      }
    });
  }

  // Применение настроек
  private applyPreferences(preferences: CloudData['preferences']): void {
    if (!preferences) return;

    // Применяем тему
    if (preferences.theme) {
      document.documentElement.setAttribute('data-theme', preferences.theme);
    }

    // Применяем язык
    if (preferences.language) {
      document.documentElement.setAttribute('lang', preferences.language);
    }
  }

  // Экспорт данных в JSON
  async exportData(): Promise<string> {
    const data: CloudData = {
      profile: await this.getProfile() || undefined,
      workouts: await this.getWorkouts() || undefined,
      progress: await this.getProgress() || undefined,
      preferences: await this.getPreferences() || undefined,
      lastSync: (await this.getLastSyncTime())?.toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  // Импорт данных из JSON
  async importData(jsonData: string): Promise<boolean> {
    try {
      const data: CloudData = JSON.parse(jsonData);

      if (data.profile) await this.saveProfile(data.profile);
      if (data.workouts) await this.saveWorkouts(data.workouts);
      if (data.progress) await this.saveProgress(data.progress);
      if (data.preferences) await this.savePreferences(data.preferences);

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export default new CloudStorageService();