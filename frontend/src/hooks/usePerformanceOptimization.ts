import { useEffect } from 'react';
import { isLowEndDevice } from '../utils/performance';

export const usePerformanceOptimization = () => {
  useEffect(() => {
    if (isLowEndDevice()) {
      // Отключаем тяжелые анимации CSS
      const style = document.createElement('style');
      style.innerHTML = `
        /* Отключение анимаций для низкопроизводительных устройств */
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        /* Отключаем тени и эффекты */
        .card, .welcome-card {
          box-shadow: none !important;
        }
        
        /* Упрощаем градиенты */
        .primary-gradient {
          background: #667eea !important;
        }
        
        /* Отключаем backdrop filters */
        * {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
        
        /* Отключаем transform на hover */
        *:hover {
          transform: none !important;
        }
      `;
      document.head.appendChild(style);

      // Отключаем requestAnimationFrame для частых обновлений
      const originalRAF = window.requestAnimationFrame;
      let frameCount = 0;
      window.requestAnimationFrame = (callback) => {
        frameCount++;
        // Пропускаем каждый второй кадр
        if (frameCount % 2 === 0) {
          return originalRAF(callback);
        }
        return setTimeout(callback, 16) as any;
      };

      // Очистка при размонтировании
      return () => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
        window.requestAnimationFrame = originalRAF;
      };
    }
  }, []);
};