// Утилиты для оптимизации производительности

export const isLowEndDevice = (): boolean => {
  // Проверка на мобильное устройство
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Проверка на Telegram WebApp
  const isTelegram = window.Telegram && window.Telegram.WebApp;
  
  // Проверка памяти устройства (если доступно)
  const deviceMemory = (navigator as any).deviceMemory;
  const isLowMemory = deviceMemory && deviceMemory < 4;
  
  // Проверка количества ядер процессора
  const hardwareConcurrency = navigator.hardwareConcurrency;
  const isLowCPU = hardwareConcurrency && hardwareConcurrency < 4;
  
  // Проверка соединения
  const connection = (navigator as any).connection;
  const isSlowConnection = connection && 
    (connection.saveData || connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g');
  
  // Если Telegram WebApp - всегда считаем low-end для безопасности
  if (isTelegram) return true;
  
  // Если мобильное устройство с низкими характеристиками
  return isMobile && (isLowMemory || isLowCPU || isSlowConnection);
};

export const shouldLoadHeavyContent = (): boolean => {
  return !isLowEndDevice();
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Приостановка тяжелых анимаций при скролле
export const pauseAnimationsOnScroll = (element: HTMLElement) => {
  let scrollTimer: NodeJS.Timeout | null = null;
  
  const handleScroll = () => {
    element.style.animationPlayState = 'paused';
    
    if (scrollTimer) clearTimeout(scrollTimer);
    
    scrollTimer = setTimeout(() => {
      element.style.animationPlayState = 'running';
    }, 150);
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
    if (scrollTimer) clearTimeout(scrollTimer);
  };
};

// Lazy load изображений
export const lazyLoadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Проверка видимости элемента
export const isElementInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Декларация для Window
declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}