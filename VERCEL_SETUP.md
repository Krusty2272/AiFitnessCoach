# 🚀 Настройка автодеплоя на Vercel

## Способ 1: Через интерфейс Vercel (рекомендуется)

### 1. Создайте аккаунт на Vercel
1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "Sign Up"
3. Выберите "Continue with GitHub"
4. Авторизуйтесь через GitHub

### 2. Импортируйте проект
1. В дашборде Vercel нажмите "Add New..." → "Project"
2. Выберите ваш репозиторий `fitness-bot`
3. В настройках укажите:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Добавьте переменные окружения
В настройках проекта добавьте:
```
VITE_API_URL=https://your-backend.railway.app/api/v1
VITE_TELEGRAM_BOT_TOKEN=8229627175:AAHcE5hizxJTOol5bMXzm9NE6fM74v4syYI
VITE_TELEGRAM_BOT_USERNAME=AIGymCoachBot
```

### 4. Деплой
Нажмите "Deploy" - Vercel автоматически:
- Склонирует репозиторий
- Установит зависимости
- Соберет проект
- Задеплоит на их CDN
- Настроит автодеплой при каждом push в main/master

## Способ 2: Через GitHub Actions

### 1. Получите токен Vercel
1. Перейдите на [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Создайте новый токен
3. Скопируйте его

### 2. Добавьте секреты в GitHub
1. Откройте Settings вашего репозитория
2. Перейдите в Secrets and variables → Actions
3. Добавьте новые секреты:
   - `VERCEL_TOKEN` - токен из п.1
   - `VERCEL_ORG_ID` - ID организации (найдете в настройках Vercel)
   - `VERCEL_PROJECT_ID` - ID проекта (создастся после первого деплоя)

### 3. GitHub Actions уже настроен
Файл `.github/workflows/deploy-frontend.yml` уже создан.
При каждом push в main/master будет автоматический деплой.

## Способ 3: Через CLI (для локального деплоя)

### 1. Установка
```bash
npm install -g vercel
```

### 2. Логин
```bash
vercel login
```

### 3. Деплой
```bash
cd frontend
vercel --prod
```

При первом деплое Vercel спросит:
- Set up and deploy? **Y**
- Which scope? Выберите ваш username
- Link to existing project? **N**
- What's your project name? **fitness-bot-frontend**
- In which directory is your code? **./frontend**
- Override settings? **N**

## 🎯 После деплоя

### Получите URL приложения
После успешного деплоя вы получите URL вида:
- Production: `https://fitness-bot-frontend.vercel.app`
- Preview: `https://fitness-bot-frontend-git-main-username.vercel.app`

### Настройте домен (опционально)
1. В настройках проекта на Vercel
2. Перейдите в Domains
3. Добавьте свой домен

### Настройте Telegram бота
1. Откройте [@BotFather](https://t.me/BotFather)
2. Выберите вашего бота
3. Bot Settings → Menu Button
4. Вставьте URL с Vercel

## 📊 Мониторинг

### Analytics
Vercel предоставляет бесплатную аналитику:
- Количество посещений
- География пользователей  
- Performance metrics
- Web Vitals

### Логи
В дашборде проекта доступны:
- Build логи
- Function логи
- Edge логи

## 🔧 Полезные команды

```bash
# Просмотр проектов
vercel ls

# Просмотр деплоев
vercel list

# Откат к предыдущей версии
vercel rollback

# Просмотр логов
vercel logs

# Установка переменных окружения
vercel env add VITE_API_URL
```

## ❓ Troubleshooting

### Build failed
- Проверьте логи билда в Vercel Dashboard
- Убедитесь что все зависимости установлены
- Проверьте версию Node.js (должна быть 18+)

### 404 на роутах
Добавьте файл `vercel.json` в папку frontend:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### CORS ошибки
Убедитесь что backend разрешает запросы с вашего Vercel домена.

## 🎉 Готово!

Теперь каждый push в main ветку автоматически деплоит frontend на Vercel!