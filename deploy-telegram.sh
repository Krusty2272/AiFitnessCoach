#!/bin/bash

# Скрипт для развертывания Telegram Mini App

echo "🚀 Начинаем развертывание Telegram Mini App..."

# Проверяем наличие необходимых инструментов
command -v node >/dev/null 2>&1 || { echo "❌ Node.js не установлен. Установите его и попробуйте снова."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm не установлен. Установите его и попробуйте снова."; exit 1; }

# Переходим в папку frontend
cd frontend

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install

# Сборка проекта
echo "🔨 Собираем production build..."
npm run build

# Проверяем успешность сборки
if [ ! -d "dist" ]; then
    echo "❌ Ошибка сборки. Папка dist не создана."
    exit 1
fi

echo "✅ Сборка завершена успешно!"

# Инструкции для деплоя
echo ""
echo "📋 Дальнейшие шаги:"
echo ""
echo "1. Загрузите содержимое папки 'frontend/dist' на ваш веб-сервер"
echo "   Рекомендуемые хостинги:"
echo "   - Vercel: npx vercel deploy dist"
echo "   - Netlify: npx netlify deploy --dir=dist"
echo "   - GitHub Pages: см. инструкцию ниже"
echo ""
echo "2. Настройте HTTPS (обязательно для Telegram WebApp)"
echo ""
echo "3. Создайте бота в @BotFather:"
echo "   - /newbot - создать нового бота"
echo "   - /mybots - выбрать вашего бота"
echo "   - Bot Settings > Menu Button > Configure Menu Button"
echo "   - Укажите URL вашего приложения"
echo ""
echo "4. Для тестирования используйте:"
echo "   https://t.me/YOUR_BOT_USERNAME/YOUR_APP_NAME"
echo ""

# Опционально: деплой на GitHub Pages
read -p "Хотите настроить GitHub Pages? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Настраиваем GitHub Pages..."
    
    # Устанавливаем gh-pages если нет
    npm install --save-dev gh-pages
    
    # Добавляем скрипт в package.json
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.scripts['deploy:gh'] = 'gh-pages -d dist';
    pkg.homepage = 'https://YOUR_USERNAME.github.io/fitness-bot';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    console.log('✅ Скрипт deploy:gh добавлен в package.json');
    console.log('⚠️  Не забудьте изменить YOUR_USERNAME на ваш GitHub username в package.json');
    "
    
    echo ""
    echo "Теперь вы можете деплоить на GitHub Pages командой:"
    echo "npm run deploy:gh"
fi

echo ""
echo "🎉 Готово!"