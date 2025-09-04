# 🚀 Инструкция по развертыванию

Проект готов к развертыванию! Папка `frontend/dist` содержит production build.

## Вариант 1: Netlify Drop (Самый простой - без регистрации!)

1. Откройте https://app.netlify.com/drop
2. Перетащите папку `frontend/dist` прямо в браузер
3. Получите мгновенную ссылку на ваше приложение!
4. Ссылка будет работать 24 часа (для постоянной нужна регистрация)

## Вариант 2: Surge.sh (Быстро через консоль)

```bash
cd frontend
npx surge dist
```
При первом запуске введите email и пароль для создания аккаунта.

## Вариант 3: Vercel (Рекомендуется)

1. Зарегистрируйтесь на https://vercel.com
2. Установите Vercel CLI:
```bash
npm i -g vercel
```
3. Авторизуйтесь:
```bash
vercel login
```
4. Деплой:
```bash
cd frontend
vercel deploy dist --prod
```

## Вариант 4: GitHub Pages

1. Создайте репозиторий на GitHub
2. Загрузите проект:
```bash
git remote add origin https://github.com/YOUR_USERNAME/fitness-bot.git
git push -u origin master
```
3. Установите gh-pages:
```bash
cd frontend
npm install --save-dev gh-pages
```
4. Добавьте в package.json:
```json
"homepage": "https://YOUR_USERNAME.github.io/fitness-bot",
"scripts": {
  "deploy": "gh-pages -d dist"
}
```
5. Деплой:
```bash
npm run deploy
```

## Вариант 5: Render.com (Бесплатный хостинг)

1. Зарегистрируйтесь на https://render.com
2. Создайте новый "Static Site"
3. Подключите GitHub репозиторий
4. Настройки:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
5. Deploy!

## 📱 Подключение к Telegram

После деплоя:

1. Откройте @BotFather в Telegram
2. Создайте бота: `/newbot`
3. Настройте Web App:
   - `/mybots` → выберите вашего бота
   - `Bot Settings` → `Menu Button`
   - Укажите URL вашего приложения

## 🔗 Текущий статус

- ✅ Production build готов в `frontend/dist`
- ✅ Приложение оптимизировано для Telegram WebApp
- ✅ Поддержка PWA
- ✅ HTTPS ready

## ⚠️ Важно

- Для Telegram WebApp обязателен HTTPS
- Все перечисленные хостинги предоставляют HTTPS автоматически
- После деплоя проверьте работу в Telegram

---

**Папка для деплоя:** `frontend/dist` (уже собрано и готово!)