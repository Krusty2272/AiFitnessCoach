@echo off
chcp 65001 >nul
echo 🚀 Начинаем развертывание Telegram Mini App...

:: Проверяем наличие Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен. Установите его и попробуйте снова.
    pause
    exit /b 1
)

:: Переходим в папку frontend
cd frontend

:: Устанавливаем зависимости
echo 📦 Устанавливаем зависимости...
call npm install

:: Сборка проекта
echo 🔨 Собираем production build...
call npm run build

:: Проверяем успешность сборки
if not exist "dist" (
    echo ❌ Ошибка сборки. Папка dist не создана.
    pause
    exit /b 1
)

echo ✅ Сборка завершена успешно!
echo.
echo 📋 Дальнейшие шаги:
echo.
echo 1. Загрузите содержимое папки 'frontend\dist' на ваш веб-сервер
echo    Рекомендуемые хостинги:
echo    - Vercel: npx vercel deploy dist
echo    - Netlify: npx netlify deploy --dir=dist
echo    - GitHub Pages: npm run deploy:gh
echo.
echo 2. Настройте HTTPS (обязательно для Telegram WebApp)
echo.
echo 3. Создайте бота в @BotFather:
echo    - /newbot - создать нового бота
echo    - /mybots - выбрать вашего бота
echo    - Bot Settings - Menu Button - Configure Menu Button
echo    - Укажите URL вашего приложения
echo.
echo 4. Для тестирования используйте:
echo    https://t.me/YOUR_BOT_USERNAME/YOUR_APP_NAME
echo.

:: Опционально: деплой на Vercel
set /p deploy_vercel="Хотите сразу задеплоить на Vercel? (y/n): "
if /i "%deploy_vercel%"=="y" (
    echo 🌐 Деплоим на Vercel...
    call npx vercel deploy dist --yes
)

echo.
echo 🎉 Готово!
pause