import particleService from './particleService';
import telegramService from './telegramService';

class HapticService {
  private hapticEnabled: boolean = true;
  private useTelegram: boolean = false;

  constructor() {
    const settings = localStorage.getItem('hapticSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.hapticEnabled = parsed.hapticEnabled ?? true;
    }
    
    // Проверяем доступность Telegram WebApp
    this.useTelegram = telegramService.isTelegramWebApp();
  }

  // Легкая вибрация для кнопок и переходов
  light() {
    if (!this.hapticEnabled) return;
    
    if (this.useTelegram) {
      telegramService.impactOccurred('light');
    } else {
      this.vibrate([10]);
    }
  }

  // Средняя вибрация для уведомлений
  medium() {
    if (!this.hapticEnabled) return;
    
    if (this.useTelegram) {
      telegramService.impactOccurred('medium');
    } else {
      this.vibrate([50]);
    }
  }

  // Сильная вибрация для важных событий
  heavy() {
    if (!this.hapticEnabled) return;
    
    if (this.useTelegram) {
      telegramService.impactOccurred('heavy');
    } else {
      this.vibrate([100]);
    }
  }

  // Двойная вибрация для ошибок
  error() {
    if (!this.hapticEnabled) return;
    
    if (this.useTelegram) {
      telegramService.notificationOccurred('error');
    } else {
      this.vibrate([50, 50, 50]);
    }
  }

  // Успех - тройная легкая вибрация
  success() {
    if (!this.hapticEnabled) return;
    
    if (this.useTelegram) {
      telegramService.notificationOccurred('success');
    } else {
      this.vibrate([30, 30, 30, 30, 30]);
    }
  }

  // Предупреждение - длинная вибрация
  warning() {
    if (!this.hapticEnabled) return;
    
    if (this.useTelegram) {
      telegramService.notificationOccurred('warning');
    } else {
      this.vibrate([200]);
    }
  }

  // Пульс для загрузки
  pulse() {
    if (!this.hapticEnabled) return;
    
    if (this.useTelegram) {
      telegramService.impactOccurred('rigid');
    } else {
      this.vibrate([100, 100, 100, 100]);
    }
  }

  // Клик для навигации
  click() {
    if (!this.hapticEnabled) return;
    
    if (this.useTelegram) {
      telegramService.selectionChanged();
    } else {
      this.vibrate([20]);
    }
  }

  // Swipe для переключения страниц
  swipe() {
    if (!this.hapticEnabled) return;
    
    if (this.useTelegram) {
      telegramService.impactOccurred('soft');
    } else {
      this.vibrate([15, 15]);
    }
  }

  private vibrate(pattern: number | number[]) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  toggle(): boolean {
    this.hapticEnabled = !this.hapticEnabled;
    this.saveSettings();
    return this.hapticEnabled;
  }

  isEnabled(): boolean {
    return this.hapticEnabled;
  }

  private saveSettings() {
    localStorage.setItem('hapticSettings', JSON.stringify({
      hapticEnabled: this.hapticEnabled
    }));
  }

  // Добавить тактильную обратную связь к элементу
  addToElement(element: HTMLElement, type: 'light' | 'medium' | 'click' = 'light') {
    const handler = (e: Event) => {
      e.preventDefault();
      this[type]();
      
      // Добавляем эффект ряби
      if (e instanceof MouseEvent || e instanceof TouchEvent) {
        const rect = element.getBoundingClientRect();
        const x = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
        const y = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
        particleService.ripple(x, y);
      }
      
      // Добавляем визуальную реакцию
      element.style.transform = 'scale(0.95)';
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 100);
    };

    element.addEventListener('touchstart', handler);
    element.addEventListener('click', handler);
  }

  // Автоматически добавить haptic ко всем кнопкам
  autoAttach() {
    document.addEventListener('DOMContentLoaded', () => {
      // Кнопки
      document.querySelectorAll('button, .btn').forEach(btn => {
        this.addToElement(btn as HTMLElement, 'click');
      });

      // Ссылки
      document.querySelectorAll('a').forEach(link => {
        this.addToElement(link as HTMLElement, 'light');
      });

      // Интерактивные элементы
      document.querySelectorAll('[data-haptic]').forEach(el => {
        const type = el.getAttribute('data-haptic') as 'light' | 'medium' | 'click' || 'light';
        this.addToElement(el as HTMLElement, type);
      });
    });
  }
}

export default new HapticService();