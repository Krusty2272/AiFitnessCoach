# 🏋️ AI Gym Coach

Персональный тренер в Telegram с использованием современных технологий и принципов чистой архитектуры.

## 🚀 Быстрый старт

```bash
# Клонирование
git clone <repository-url>
cd fitness-bot

# Настройка
cp env.example .env
# Отредактируйте .env файл

# Запуск
cd frontend && npm install && npm run dev
cd backend && pip install -r requirements.txt && python main.py
```

## 📚 Документация

- [📖 Основная документация](./docs/README.md)
- [🏗️ Архитектура](./docs/architecture.md)
- [📡 API документация](./docs/api.md)
- [🚀 Развертывание](./docs/deployment.md)
- [👨‍💻 Разработка](./docs/development.md)

## 🛠️ Технологии

### Frontend
- React 18 + TypeScript
- Vite + Tailwind CSS
- Telegram WebApp SDK

### Backend
- FastAPI + Python 3.11
- SQLAlchemy + PostgreSQL
- Prometheus + Structlog

### Infrastructure
- Docker + Docker Compose
- Nginx + SSL

## 📁 Структура проекта

```
fitness-bot/
├── frontend/          # React приложение
├── backend/           # FastAPI сервер
├── docs/              # Документация
├── infrastructure/    # Docker, Nginx
└── scripts/           # Скрипты развертывания
```

## 🔧 Конфигурация

Создайте файл `.env` на основе `env.example`:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/aigym_coach

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token

# Server
API_HOST=0.0.0.0
API_PORT=8000
```

## 🐳 Docker

```bash
docker-compose up --build
```

## 📱 Telegram Mini App

1. Создайте бота через @BotFather
2. Настройте WebApp URL
3. Добавьте токен в переменные окружения
4. Отправьте `/start` боту

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License

---

**AI Gym Coach** - Ваш персональный тренер в Telegram! 🏋️ 