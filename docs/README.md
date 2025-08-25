# AI Gym Coach - Персональный тренер в Telegram

## 🏋️ Описание проекта

AI Gym Coach - это Telegram Mini App, который предоставляет персональные тренировки и отслеживание прогресса. Приложение использует современные технологии и следует принципам чистой архитектуры.

## 🏗️ Архитектура

Проект построен на принципах **Clean Architecture** с четким разделением слоев:

```
fitness-bot/
├── frontend/          # Presentation Layer (React + TypeScript)
├── backend/           # Application & Domain Layers (FastAPI + Python)
├── docs/              # Documentation
├── infrastructure/    # Infrastructure Layer (Docker, Nginx)
└── scripts/           # Build & Deployment Scripts
```

### Слои архитектуры:

1. **Presentation Layer** - React приложение с Telegram WebApp SDK
2. **Application Layer** - Use cases и application services
3. **Domain Layer** - Бизнес-логика и domain entities
4. **Infrastructure Layer** - База данных, внешние API, фреймворки

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- Python 3.11+
- Docker (опционально)
- Telegram Bot Token

### Локальная разработка

1. **Клонируйте репозиторий**
```bash
git clone <repository-url>
cd fitness-bot
```

2. **Настройте переменные окружения**
```bash
cp env.example .env
# Отредактируйте .env файл
```

3. **Запустите фронтенд**
```bash
cd frontend
npm install
npm run dev
```

4. **Запустите бэкенд**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Docker развертывание

```bash
docker-compose up --build
```

## 📱 Telegram Mini App

### Настройка бота

1. Создайте бота через @BotFather
2. Получите токен бота
3. Настройте WebApp URL в BotFather
4. Добавьте токен в переменные окружения

### Тестирование

- **Локально**: http://localhost:3000
- **Telegram**: Найдите вашего бота и отправьте `/start`

## 🛠️ Технологический стек

### Frontend
- **React 18** - UI библиотека
- **TypeScript** - Типизация
- **Vite** - Сборщик
- **Tailwind CSS** - Стилизация
- **Telegram WebApp SDK** - Интеграция с Telegram

### Backend
- **FastAPI** - Web фреймворк
- **SQLAlchemy** - ORM
- **PostgreSQL/SQLite** - База данных
- **Pydantic** - Валидация данных
- **Prometheus** - Мониторинг

### Infrastructure
- **Docker** - Контейнеризация
- **Nginx** - Веб-сервер
- **PostgreSQL** - База данных

## 📁 Структура проекта

### Frontend (`frontend/`)
```
src/
├── components/        # React компоненты
│   ├── ui/           # Базовые UI компоненты
│   └── ...           # Специфичные компоненты
├── pages/            # Страницы приложения
├── services/         # API сервисы
├── hooks/            # React хуки
├── store/            # State management
├── types/            # TypeScript типы
└── utils/            # Утилиты
```

### Backend (`backend/`)
```
app/
├── api/              # API endpoints
│   └── v1/           # API версионирование
├── core/             # Конфигурация и настройки
├── domain/           # Domain entities и бизнес-логика
├── infrastructure/   # Внешние зависимости
└── services/         # Application services
```

## 🔧 Конфигурация

### Переменные окружения

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost/dbname
DATABASE_TEST_URL=sqlite:///./test.db

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
VITE_TELEGRAM_BOT_TOKEN=your-bot-token

# Server
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true
```

## 📊 Мониторинг

- **Health Check**: `/health`
- **Metrics**: `/metrics` (Prometheus)
- **API Docs**: `/docs` (Swagger UI)

## 🧪 Тестирование

```bash
# Frontend тесты
cd frontend
npm test

# Backend тесты
cd backend
pytest
```

## 📚 Документация

- [Архитектура](./architecture.md)
- [API документация](./api.md)
- [Развертывание](./deployment.md)
- [Разработка](./development.md)

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📄 Лицензия

MIT License

---

**AI Gym Coach** - Ваш персональный тренер в Telegram! 🏋️ 