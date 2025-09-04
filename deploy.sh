#!/bin/bash

echo "🚀 Начинаем деплой AI Gym Coach..."

# Frontend деплой на Vercel
echo "📦 Деплой Frontend на Vercel..."
cd frontend

# Проверяем установлен ли Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📥 Устанавливаем Vercel CLI..."
    npm i -g vercel
fi

# Деплоим на Vercel
echo "🌐 Загружаем на Vercel..."
vercel --prod --yes

echo "✅ Frontend задеплоен!"

# Backend деплой (если нужно)
echo ""
echo "📝 Для backend используйте один из вариантов:"
echo "1. Railway.app - railway up"
echo "2. Render.com - git push"
echo "3. Fly.io - flyctl deploy"
echo ""

# Настройка Telegram Bot
echo "🤖 Настройка Telegram Bot:"
echo "1. Откройте @BotFather"
echo "2. Выберите вашего бота"
echo "3. Bot Settings → Menu Button"
echo "4. Вставьте URL от Vercel"

echo ""
echo "✨ Деплой завершен!"