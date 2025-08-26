import { initData, miniApp, themeParams, viewport, backButton, mainButton, hapticFeedback, cloudStorage, biometrics } from '@telegram-apps/sdk-react';

export interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  languageCode?: string;
  isPremium?: boolean;
}

export interface TelegramTheme {
  bgColor?: string;
  textColor?: string;
  hintColor?: string;
  linkColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  secondaryBgColor?: string;
  headerBgColor?: string;
  accentTextColor?: string;
  sectionBgColor?: string;
  sectionHeaderTextColor?: string;
  subtitleTextColor?: string;
  destructiveTextColor?: string;
}

class TelegramService {
  private isInitialized = false;
  private user: TelegramUser | null = null;
  private theme: TelegramTheme = {};
  private platform: string = 'unknown';
  private version: string = '0.0.0';

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Проверяем, что мы в Telegram WebApp
      if (!this.isTelegramWebApp()) {
        console.warn('Not running in Telegram WebApp environment');
        return;
      }

      // Инициализируем SDK компоненты
      await Promise.all([
        miniApp.mount(),
        initData.restore(),
        themeParams.mount(),
        viewport.mount(),
        backButton.mount(),
        mainButton.mount(),
        hapticFeedback.mount(),
        cloudStorage.mount()
      ]);

      // Настраиваем mini app
      miniApp.ready();
      miniApp.setHeaderColor('#667eea');
      
      // Расширяем viewport на всю высоту
      viewport.expand();

      // Получаем данные пользователя
      const userData = initData.user();
      if (userData) {
        this.user = {
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username,
          photoUrl: userData.photoUrl,
          languageCode: userData.languageCode,
          isPremium: userData.isPremium
        };
      }

      // Получаем тему
      this.theme = themeParams.state() || {};
      
      // Получаем платформу
      this.platform = miniApp.platform() || 'unknown';
      this.version = miniApp.version() || '0.0.0';

      // Подписываемся на изменения темы
      themeParams.listen('change', () => {
        this.theme = themeParams.state() || {};
        this.applyTheme();
      });

      // Применяем тему
      this.applyTheme();

      this.isInitialized = true;
      console.log('Telegram WebApp initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Telegram WebApp:', error);
    }
  }

  isTelegramWebApp(): boolean {
    return typeof window !== 'undefined' && 
           window.Telegram && 
           window.Telegram.WebApp;
  }

  getUser(): TelegramUser | null {
    return this.user;
  }

  getTheme(): TelegramTheme {
    return this.theme;
  }

  getPlatform(): string {
    return this.platform;
  }

  getVersion(): string {
    return this.version;
  }

  getInitData(): string {
    if (!this.isTelegramWebApp()) return '';
    return initData.raw() || '';
  }

  // Хаптик фидбек
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
    if (!this.isInitialized) return;
    hapticFeedback.impactOccurred(style);
  }

  notificationOccurred(type: 'error' | 'success' | 'warning' = 'success') {
    if (!this.isInitialized) return;
    hapticFeedback.notificationOccurred(type);
  }

  selectionChanged() {
    if (!this.isInitialized) return;
    hapticFeedback.selectionChanged();
  }

  // Главная кнопка
  showMainButton(text: string, onClick: () => void) {
    if (!this.isInitialized) return;
    
    mainButton.setParams({
      text,
      isVisible: true,
      isEnabled: true,
      isProgressVisible: false,
      color: '#667eea',
      textColor: '#ffffff'
    });

    mainButton.on('click', onClick);
  }

  hideMainButton() {
    if (!this.isInitialized) return;
    mainButton.hide();
  }

  setMainButtonProgress(visible: boolean) {
    if (!this.isInitialized) return;
    mainButton.setParams({ isProgressVisible: visible });
  }

  // Кнопка "Назад"
  showBackButton(onClick: () => void) {
    if (!this.isInitialized) return;
    backButton.show();
    backButton.on('click', onClick);
  }

  hideBackButton() {
    if (!this.isInitialized) return;
    backButton.hide();
  }

  // Cloud Storage
  async saveToCloud(key: string, value: string): Promise<boolean> {
    if (!this.isInitialized) return false;
    
    try {
      await cloudStorage.set(key, value);
      return true;
    } catch (error) {
      console.error('Failed to save to cloud storage:', error);
      return false;
    }
  }

  async getFromCloud(key: string): Promise<string | null> {
    if (!this.isInitialized) return null;
    
    try {
      return await cloudStorage.get(key) || null;
    } catch (error) {
      console.error('Failed to get from cloud storage:', error);
      return null;
    }
  }

  async removeFromCloud(key: string): Promise<boolean> {
    if (!this.isInitialized) return false;
    
    try {
      await cloudStorage.delete(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from cloud storage:', error);
      return false;
    }
  }

  // Биометрия (если доступна)
  async requestBiometrics(reason: string): Promise<boolean> {
    if (!this.isInitialized) return false;
    
    try {
      if (biometrics.isSupported()) {
        biometrics.mount();
        const result = await biometrics.authenticate({ reason });
        return result.status === 'authorized';
      }
      return false;
    } catch (error) {
      console.error('Biometrics failed:', error);
      return false;
    }
  }

  // Применение темы к приложению
  private applyTheme() {
    if (!this.theme) return;

    const root = document.documentElement;
    
    // Мапинг Telegram цветов на наши CSS переменные
    if (this.theme.bgColor) {
      root.style.setProperty('--background-primary', this.theme.bgColor);
    }
    if (this.theme.secondaryBgColor) {
      root.style.setProperty('--background-secondary', this.theme.secondaryBgColor);
    }
    if (this.theme.textColor) {
      root.style.setProperty('--text-primary', this.theme.textColor);
    }
    if (this.theme.hintColor) {
      root.style.setProperty('--text-secondary', this.theme.hintColor);
    }
    if (this.theme.buttonColor) {
      root.style.setProperty('--primary-color', this.theme.buttonColor);
    }
    if (this.theme.buttonTextColor) {
      root.style.setProperty('--primary-text', this.theme.buttonTextColor);
    }
    if (this.theme.linkColor) {
      root.style.setProperty('--link-color', this.theme.linkColor);
    }
    if (this.theme.destructiveTextColor) {
      root.style.setProperty('--danger-color', this.theme.destructiveTextColor);
    }

    // Добавляем класс для Telegram стилей
    document.body.classList.add('telegram-webapp');
  }

  // Открытие ссылок
  openLink(url: string, options?: { tryInstantView?: boolean }) {
    if (!this.isTelegramWebApp()) {
      window.open(url, '_blank');
      return;
    }
    
    miniApp.openLink(url, options);
  }

  // Открытие Telegram ссылок
  openTelegramLink(url: string) {
    if (!this.isTelegramWebApp()) {
      window.open(url, '_blank');
      return;
    }
    
    miniApp.openTelegramLink(url);
  }

  // Поделиться
  shareURL(url: string, text?: string) {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text || '')}`;
    this.openTelegramLink(shareUrl);
  }

  // Закрытие приложения
  close() {
    if (!this.isInitialized) return;
    miniApp.close();
  }

  // Показать подтверждение при закрытии
  enableClosingConfirmation() {
    if (!this.isInitialized) return;
    miniApp.setClosingConfirmation(true);
  }

  disableClosingConfirmation() {
    if (!this.isInitialized) return;
    miniApp.setClosingConfirmation(false);
  }

  // Показать попап
  async showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }): Promise<string | null> {
    if (!this.isTelegramWebApp()) {
      alert(params.message);
      return null;
    }

    try {
      const result = await miniApp.showPopup(params);
      return result || null;
    } catch (error) {
      console.error('Failed to show popup:', error);
      return null;
    }
  }

  // Показать алерт
  async showAlert(message: string): Promise<void> {
    await this.showPopup({ message });
  }

  // Показать подтверждение
  async showConfirm(message: string): Promise<boolean> {
    const result = await this.showPopup({
      message,
      buttons: [
        { type: 'cancel', text: 'Отмена' },
        { type: 'ok', text: 'OK' }
      ]
    });
    return result === 'ok';
  }
}

// Добавляем типы для Window
declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

export default new TelegramService();