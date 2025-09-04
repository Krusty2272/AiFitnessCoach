import axios from 'axios';
import telegramService from './telegramService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Создаем экземпляр axios для API запросов
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    telegram_id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    is_premium: boolean;
    level: number;
    experience: number;
    streak_days: number;
  };
}

interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_premium: boolean;
  level: number;
  experience: number;
  streak_days: number;
  total_workouts: number;
  total_minutes: number;
  preferences?: any;
}

class AuthService {
  private TOKEN_KEY = 'fitness_bot_token';
  private USER_KEY = 'fitness_bot_user';

  constructor() {
    // Настраиваем axios для добавления токена в заголовки
    this.setupAxiosInterceptor();
  }

  private setupAxiosInterceptor() {
    api.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Обработка 401 ошибок
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Токен истек или невалидный
          this.logout();
          // Пробуем переавторизоваться через Telegram
          if (telegramService.isTelegramWebApp()) {
            await this.loginWithTelegram();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async loginWithTelegram(): Promise<User | null> {
    try {
      // Получаем initData от Telegram
      const initData = telegramService.getInitData();
      
      if (!initData) {
        console.error('No Telegram init data available');
        return null;
      }

      // Отправляем на сервер для валидации
      const response = await api.post<AuthResponse>('/auth/telegram/auth', null, {
        params: { init_data: initData }
      });

      if (response.data) {
        // Сохраняем токен и данные пользователя
        this.saveToken(response.data.access_token);
        this.saveUser(response.data.user);
        
        // Уведомляем Telegram что авторизация прошла
        telegramService.notificationOccurred('success');
        
        return response.data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Telegram auth failed:', error);
      telegramService.notificationOccurred('error');
      return null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // Сначала проверяем локальный кэш
      const cachedUser = this.getUser();
      if (cachedUser) {
        return cachedUser;
      }

      // Если нет в кэше, запрашиваем с сервера
      const response = await api.get<User>('/auth/me');
      
      if (response.data) {
        this.saveUser(response.data);
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const response = await api.post<AuthResponse>('/auth/refresh');
      
      if (response.data) {
        this.saveToken(response.data.access_token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await api.post('/api/v1/auth/validate-token');
      return response.data?.valid || false;
    } catch (error) {
      return false;
    }
  }

  logout() {
    // Очищаем локальные данные
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    
    // Уведомляем сервер
    api.post('/api/v1/auth/logout').catch(() => {});
    
    // Закрываем Telegram Mini App если нужно
    if (telegramService.isTelegramWebApp()) {
      telegramService.close();
    }
  }

  // Управление токеном
  saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  // Управление данными пользователя
  saveUser(user: User) {
    const userStr = JSON.stringify(user);
    localStorage.setItem(this.USER_KEY, userStr);
    sessionStorage.setItem(this.USER_KEY, userStr);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.hasToken() && !!this.getUser();
  }

  // Обновление профиля пользователя
  async updateProfile(data: Partial<User>): Promise<User | null> {
    try {
      const response = await api.put<User>('/api/v1/users/profile', data);
      
      if (response.data) {
        this.saveUser(response.data);
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return null;
    }
  }

  // Автоматическая авторизация при запуске
  async autoLogin(): Promise<User | null> {
    // Если мы в Telegram WebApp
    if (telegramService.isTelegramWebApp()) {
      return this.loginWithTelegram();
    }
    
    // Если есть токен, проверяем его валидность
    if (this.hasToken()) {
      const isValid = await this.validateToken();
      if (isValid) {
        return this.getCurrentUser();
      } else {
        // Токен невалидный, пробуем обновить
        const refreshed = await this.refreshToken();
        if (refreshed) {
          return this.getCurrentUser();
        }
      }
    }
    
    return null;
  }

  // Получение уровня и опыта
  calculateLevelProgress(experience: number): { level: number; progress: number; nextLevelExp: number } {
    // Формула: опыт для следующего уровня = level * 100
    let level = 1;
    let totalExp = 0;
    
    while (totalExp + (level * 100) <= experience) {
      totalExp += level * 100;
      level++;
    }
    
    const currentLevelExp = experience - totalExp;
    const nextLevelExp = level * 100;
    const progress = (currentLevelExp / nextLevelExp) * 100;
    
    return {
      level,
      progress,
      nextLevelExp: nextLevelExp - currentLevelExp
    };
  }
}

export default new AuthService();