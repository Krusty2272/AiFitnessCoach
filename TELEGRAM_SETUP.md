# 🤖 Настройка Telegram Mini App

## Быстрый старт

### 1. Деплой Frontend
```bash
# Windows
deploy.bat

# Mac/Linux
./deploy.sh
```

### 2. Настройка бота в Telegram

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/mybots`
3. Выберите вашего бота (или создайте нового через `/newbot`)
4. Нажмите **Bot Settings**
5. Выберите **Menu Button** → **Configure menu button**
6. Отправьте URL вашего приложения с Vercel

### 3. Тестирование

1. Откройте вашего бота в Telegram
2. Нажмите кнопку меню (рядом с полем ввода)
3. Приложение должно открыться в Mini App

## Создание нового бота (если нужно)

1. В [@BotFather](https://t.me/BotFather) отправьте `/newbot`
2. Введите имя бота: `AI Gym Coach`
3. Введите username: `AIGymCoachBot` (должен заканчиваться на `bot`)
4. Сохраните токен: `8229627175:AAHcE5hizxJTOol5bMXzm9NE6fM74v4syYI`

## Настройка Mini App

### Основные команды BotFather:
- `/mybots` - управление ботами
- `/setname` - изменить имя бота
- `/setdescription` - описание бота
- `/setabouttext` - текст "О боте"
- `/setuserpic` - аватар бота
- `/setcommands` - команды бота
- `/setmenubutton` - кнопка Web App

### Рекомендуемые настройки:

**Описание:**
```
🏋️ AI Фитнес Тренер
Персональные тренировки с искусственным интеллектом
```

**About:**
```
AI Gym Coach - ваш персональный фитнес-ассистент:
• 🎯 Персонализированные тренировки
• 📊 Отслеживание прогресса
• 🏆 Система достижений
• 💪 Адаптивная сложность
```

**Команды:**
```
start - Запустить приложение
help - Помощь
stats - Моя статистика
workout - Начать тренировку
progress - Мой прогресс
```

## Проверка работы

### ✅ Должно работать:
- Открытие Mini App через кнопку меню
- Автоматическая авторизация через Telegram
- Сохранение данных пользователя
- Haptic feedback на мобильных
- Темная/светлая тема от Telegram

### ⚠️ Известные ограничения:
- Mini App работает только через HTTPS
- Некоторые функции недоступны в Desktop Telegram
- Биометрия пока не поддерживается

## Переменные окружения

### Frontend (.env.production):
```env
VITE_API_URL=https://your-backend-url.com
VITE_TELEGRAM_BOT_TOKEN=your-bot-token
VITE_TELEGRAM_BOT_USERNAME=YourBotUsername
```

### Backend (.env):
```env
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_WEBHOOK_URL=https://your-backend-url.com/webhook
TELEGRAM_MINIAPP_URL=https://your-frontend.vercel.app
```

## Деплой Backend

### Railway.app (рекомендуется):
1. Создайте аккаунт на [Railway](https://railway.app)
2. Создайте новый проект
3. Подключите GitHub репозиторий
4. Добавьте PostgreSQL
5. Установите переменные окружения
6. Deploy!

### Альтернативы:
- **Render.com** - бесплатный план с ограничениями
- **Fly.io** - нужна кредитная карта
- **Heroku** - платный

## Мониторинг

### Telegram Analytics:
- Количество пользователей
- Активность по дням
- География пользователей

### Vercel Analytics:
- Загрузка страниц
- Ошибки
- Performance metrics

## Поддержка

Проблемы? Создайте issue в репозитории или напишите в Telegram: @your_support_bot