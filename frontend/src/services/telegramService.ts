import WebApp from '@twa-dev/sdk';

export class TelegramService {
  static init() {
    try {
      // Initialize Telegram WebApp
      WebApp.ready();
      
      // Expand the app to full height
      WebApp.expand();
      
      // Set header color to match our dark theme
      WebApp.setHeaderColor('#2d2d2d');
      
      // Set background color
      WebApp.setBackgroundColor('#1a1a1a');
      
      // Enable closing confirmation
      WebApp.enableClosingConfirmation();
      
      console.log('Telegram WebApp initialized successfully');
      console.log('Platform:', WebApp.platform);
      console.log('Version:', WebApp.version);
      console.log('Color scheme:', WebApp.colorScheme);
      console.log('Viewport height:', WebApp.viewportHeight);
    } catch (error) {
      console.warn('Telegram WebApp not available, running in test mode:', error);
    }
  }

  static getUser() {
    try {
      return WebApp.initDataUnsafe?.user;
    } catch (error) {
      console.warn('Could not get user data:', error);
      return null;
    }
  }

  static getUserId(): number | null {
    try {
      const user = this.getUser();
      return user?.id || null;
    } catch (error) {
      console.warn('Could not get user ID:', error);
      return null;
    }
  }

  static getUserInfo() {
    try {
      const user = this.getUser();
      return {
        id: user?.id,
        username: user?.username,
        first_name: user?.first_name,
        last_name: user?.last_name,
      };
    } catch (error) {
      console.warn('Could not get user info:', error);
      return {
        id: null,
        username: null,
        first_name: null,
        last_name: null,
      };
    }
  }

  static showAlert(message: string) {
    try {
      WebApp.showAlert(message);
    } catch (error) {
      console.warn('Could not show alert:', error);
      alert(message); // Fallback to browser alert
    }
  }

  static showConfirm(message: string, callback: (confirmed: boolean) => void) {
    try {
      WebApp.showConfirm(message, callback);
    } catch (error) {
      console.warn('Could not show confirm:', error);
      const confirmed = confirm(message); // Fallback to browser confirm
      callback(confirmed);
    }
  }

  static showPopup(title: string, message: string, buttons: any[] = []) {
    try {
      WebApp.showPopup({ title, message, buttons });
    } catch (error) {
      console.warn('Could not show popup:', error);
      alert(`${title}\n\n${message}`); // Fallback to browser alert
    }
  }

  static close() {
    try {
      WebApp.close();
    } catch (error) {
      console.warn('Could not close app:', error);
    }
  }

  static isTelegramWebApp(): boolean {
    try {
      return typeof window !== 'undefined' && 'Telegram' in window;
    } catch (error) {
      return false;
    }
  }

  static getThemeParams() {
    try {
      return WebApp.themeParams;
    } catch (error) {
      console.warn('Could not get theme params:', error);
      return {
        bg_color: '#1a1a1a',
        text_color: '#ffffff',
        hint_color: '#9ca3af',
        link_color: '#6366f1',
        button_color: '#6366f1',
        button_text_color: '#ffffff'
      };
    }
  }

  static getColorScheme(): 'light' | 'dark' {
    try {
      return WebApp.colorScheme;
    } catch (error) {
      console.warn('Could not get color scheme:', error);
      return 'dark';
    }
  }

  static getViewportHeight(): number {
    try {
      return WebApp.viewportHeight;
    } catch (error) {
      console.warn('Could not get viewport height:', error);
      return window.innerHeight;
    }
  }

  static getViewportStableHeight(): number {
    try {
      return WebApp.viewportStableHeight;
    } catch (error) {
      console.warn('Could not get viewport stable height:', error);
      return window.innerHeight;
    }
  }

  static getPlatform(): string {
    try {
      return WebApp.platform;
    } catch (error) {
      console.warn('Could not get platform:', error);
      return 'web';
    }
  }

  static getVersion(): string {
    try {
      return WebApp.version;
    } catch (error) {
      console.warn('Could not get version:', error);
      return 'test';
    }
  }

  static getInitData(): string {
    try {
      return WebApp.initData;
    } catch (error) {
      console.warn('Could not get init data:', error);
      return '';
    }
  }

  static getInitDataUnsafe(): any {
    try {
      return WebApp.initDataUnsafe;
    } catch (error) {
      console.warn('Could not get init data unsafe:', error);
      return {};
    }
  }

  static isExpanded(): boolean {
    try {
      return WebApp.isExpanded;
    } catch (error) {
      console.warn('Could not get expanded state:', error);
      return false;
    }
  }

  static isViewportExpanded(): boolean {
    try {
      return WebApp.isExpanded;
    } catch (error) {
      console.warn('Could not get viewport expanded state:', error);
      return false;
    }
  }

  static getBackButton(): any {
    try {
      return WebApp.BackButton;
    } catch (error) {
      console.warn('Could not get back button:', error);
      return null;
    }
  }

  static getMainButton(): any {
    try {
      return WebApp.MainButton;
    } catch (error) {
      console.warn('Could not get main button:', error);
      return null;
    }
  }

  static getHapticFeedback(): any {
    try {
      return WebApp.HapticFeedback;
    } catch (error) {
      console.warn('Could not get haptic feedback:', error);
      return null;
    }
  }
} 