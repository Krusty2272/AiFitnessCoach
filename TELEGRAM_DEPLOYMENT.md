# 🤖 Telegram Mini App - Инструкция по развертыванию

## 📋 Требования

- Node.js 18+
- npm или yarn
- HTTPS хостинг (обязательно для Telegram WebApp)
- Telegram Bot (создается через @BotFather)

## 🚀 Быстрый старт

### 1. Локальная разработка

```bash
# Установка зависимостей
cd frontend
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

### 2. Создание Telegram бота

1. Откройте @BotFather в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните токен бота (понадобится для backend)

### 3. Настройка Mini App

1. В @BotFather выберите вашего бота
2. Перейдите в `Bot Settings` → `Menu Button`
3. Нажмите `Configure Menu Button`
4. Укажите URL вашего приложения (должен быть HTTPS)
5. Введите название кнопки (например, "🏋️ Открыть тренера")

### 4. Деплой на хостинг

#### Vercel (Рекомендуется)

```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой
cd frontend
vercel deploy dist
```

#### Netlify

```bash
# Установка Netlify CLI
npm i -g netlify-cli

# Деплой
cd frontend
netlify deploy --dir=dist --prod
```

#### GitHub Pages

1. Добавьте в `frontend/package.json`:
```json
{
  "homepage": "https://YOUR_USERNAME.github.io/fitness-bot",
  "scripts": {
    "deploy:gh": "gh-pages -d dist"
  }
}
```

2. Установите gh-pages:
```bash
npm install --save-dev gh-pages
```

3. Деплойте:
```bash
npm run build
npm run deploy:gh
```

## 🔐 Безопасность

### Валидация InitData

Приложение автоматически проверяет подлинность данных от Telegram. Для backend валидации используйте:

```javascript
// backend/validateTelegram.js
const crypto = require('crypto');

function validateTelegramData(initData, botToken) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return calculatedHash === hash;
}
```

## 🎨 Темы и стили

Приложение автоматически адаптируется под тему Telegram:

- Светлая/темная тема
- Цветовая схема пользователя
- Нативные элементы управления

## 📱 Функции Telegram WebApp

### Доступные API:

- **MainButton** - главная кнопка действия
- **BackButton** - кнопка "Назад"
- **HapticFeedback** - тактильная отдача
- **CloudStorage** - облачное хранилище (до 1024 ключей)
- **BiometricAuth** - биометрическая аутентификация
- **QRScanner** - сканер QR-кодов
- **Popup** - нативные попапы
- **Theme** - данные о теме

### Пример использования в коде:

```typescript
import { useTelegram } from './contexts/TelegramContext';

function MyComponent() {
  const { 
    user, 
    mainButton, 
    haptic, 
    cloud,
    utils 
  } = useTelegram();
  
  // Показать главную кнопку
  mainButton.show('Начать тренировку', () => {
    haptic.impact('medium');
    // Действие при клике
  });
  
  // Сохранить в облако
  await cloud.save('workouts', workoutsData);
  
  // Показать попап
  await utils.showAlert('Тренировка завершена!');
}
```

## 🧪 Тестирование

### В браузере:
```
http://localhost:5173
```

### В Telegram (после деплоя):
```
https://t.me/YOUR_BOT_USERNAME/YOUR_APP_NAME
```

### Debug режим:
Добавьте `?tgWebAppDebug=1` к URL для отладки

## 📊 Аналитика

Рекомендуем подключить:
- Google Analytics 4
- Яндекс.Метрика
- Telegram Analytics (через бота)

## ⚡ Оптимизация

1. **Размер бандла**: < 500KB
2. **Lazy loading** для тяжелых компонентов
3. **Service Worker** для офлайн режима
4. **WebP/AVIF** для изображений
5. **CDN** для статики

## 🆘 Частые проблемы

### "Telegram WebApp не инициализирован"
- Проверьте подключение скрипта в index.html
- Убедитесь, что открываете через Telegram

### "Кнопки не работают"
- Проверьте HTTPS сертификат
- Обновите Telegram до последней версии

### "Тема не применяется"
- Проверьте TelegramProvider в App.tsx
- Убедитесь, что CSS переменные настроены

## 📚 Полезные ссылки

- [Telegram WebApp Documentation](https://core.telegram.org/bots/webapps)
- [Bot API Documentation](https://core.telegram.org/bots/api)
- [@BotFather](https://t.me/botfather)
- [@BotSupport](https://t.me/botsupport)

## 🤝 Поддержка

Если возникли вопросы:
1. Проверьте эту документацию
2. Посмотрите [issues на GitHub](https://github.com/your-repo/issues)
3. Напишите в [Telegram чат поддержки](https://t.me/your_support)

---

*Последнее обновление: 2025-08-26*