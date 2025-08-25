# 👨‍💻 Руководство по разработке

## Начало работы

### Предварительные требования

- Node.js 18+
- Python 3.11+
- Git
- IDE (VS Code, PyCharm, WebStorm)
- Docker (опционально)

### Настройка окружения

```bash
# Клонирование репозитория
git clone <repository-url>
cd fitness-bot

# Установка зависимостей
cd frontend && npm install
cd ../backend && pip install -r requirements.txt

# Настройка переменных окружения
cp env.example .env
# Отредактируйте .env файл
```

## Структура проекта

### Frontend (React + TypeScript)

```
frontend/src/
├── components/           # React компоненты
│   ├── ui/              # Базовые UI компоненты
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── Navigation.tsx   # Навигация
│   ├── Notification.tsx # Уведомления
│   └── ...
├── pages/               # Страницы приложения
│   ├── HomePage.tsx
│   ├── GenerateWorkoutPage.tsx
│   ├── WorkoutPage.tsx
│   └── ProfilePage.tsx
├── services/            # API сервисы
│   ├── api.ts          # HTTP клиент
│   ├── telegramService.ts # Telegram SDK
│   ├── userService.ts
│   └── workoutService.ts
├── hooks/               # React хуки
│   └── useNotification.ts
├── store/               # State management
├── types/               # TypeScript типы
│   └── index.ts
└── utils/               # Утилиты
```

### Backend (FastAPI + Python)

```
backend/app/
├── api/                 # API endpoints
│   ├── __init__.py
│   ├── dependencies.py  # Зависимости API
│   └── v1/             # API версионирование
│       ├── __init__.py
│       ├── api.py      # Основной роутер
│       └── endpoints/  # API endpoints
│           ├── users.py
│           ├── workouts.py
│           └── exercises.py
├── core/               # Конфигурация и настройки
│   ├── config.py       # Основная конфигурация
│   ├── database.py     # Database connection
│   └── security.py     # Security utilities
├── models/             # SQLAlchemy модели
│   ├── user.py
│   ├── workout.py
│   └── exercise.py
└── services/           # Бизнес-логика
    ├── user_service.py
    ├── workout_service.py
    └── exercise_service.py
```

## Принципы разработки

### 1. Clean Architecture

Следуйте принципам чистой архитектуры:

- **Presentation Layer** - только UI и обработка пользовательского ввода
- **Application Layer** - оркестрация бизнес-процессов
- **Domain Layer** - бизнес-логика и правила
- **Infrastructure Layer** - внешние зависимости

### 2. SOLID принципы

- **S** - Single Responsibility Principle
- **O** - Open/Closed Principle
- **L** - Liskov Substitution Principle
- **I** - Interface Segregation Principle
- **D** - Dependency Inversion Principle

### 3. Code Style

#### Frontend (TypeScript/React)

```typescript
// Используйте функциональные компоненты
const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await userService.updateUser(user);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Профиль пользователя</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Содержимое */}
      </CardContent>
    </Card>
  );
};
```

#### Backend (Python/FastAPI)

```python
# Используйте типизацию
from typing import List, Optional
from pydantic import BaseModel

class UserCreate(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    first_name: str
    last_name: Optional[str] = None

class UserService:
    def __init__(self, repository: UserRepository):
        self.repository = repository
    
    async def create_user(self, user_data: UserCreate) -> User:
        user = User(**user_data.dict())
        return await self.repository.save(user)
```

### 4. Именование

#### Frontend
- **Компоненты**: PascalCase (`UserProfile.tsx`)
- **Функции**: camelCase (`getUserData`)
- **Константы**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Типы**: PascalCase (`UserProfileProps`)

#### Backend
- **Классы**: PascalCase (`UserService`)
- **Функции**: snake_case (`create_user`)
- **Переменные**: snake_case (`user_data`)
- **Константы**: UPPER_SNAKE_CASE (`DATABASE_URL`)

## Рабочий процесс

### 1. Создание новой функции

```bash
# Создайте новую ветку
git checkout -b feature/user-profile

# Разработайте функцию
# ...

# Добавьте тесты
# ...

# Создайте Pull Request
git push origin feature/user-profile
```

### 2. Структура коммитов

Используйте conventional commits:

```
feat: добавить профиль пользователя
fix: исправить ошибку валидации email
docs: обновить README
style: форматирование кода
refactor: рефакторинг UserService
test: добавить тесты для UserService
chore: обновить зависимости
```

### 3. Code Review

- Проверяйте код перед созданием PR
- Используйте линтеры и форматтеры
- Добавляйте тесты для новой функциональности
- Обновляйте документацию при необходимости

## Тестирование

### Frontend тесты

```bash
# Запуск тестов
npm test

# Запуск тестов в watch режиме
npm run test:watch

# Покрытие кода
npm run test:coverage
```

#### Пример теста

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('should display user information', () => {
    const user = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe'
    };
    
    render(<UserProfile user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
  
  it('should handle save button click', async () => {
    const mockSave = jest.fn();
    render(<UserProfile user={user} onSave={mockSave} />);
    
    fireEvent.click(screen.getByText('Сохранить'));
    
    expect(mockSave).toHaveBeenCalled();
  });
});
```

### Backend тесты

```bash
# Запуск тестов
pytest

# Запуск тестов с покрытием
pytest --cov=app

# Запуск конкретного теста
pytest tests/test_user_service.py::test_create_user
```

#### Пример теста

```python
import pytest
from unittest.mock import Mock
from app.services.user_service import UserService
from app.models.user import User

class TestUserService:
    @pytest.fixture
    def mock_repository(self):
        return Mock()
    
    @pytest.fixture
    def user_service(self, mock_repository):
        return UserService(mock_repository)
    
    async def test_create_user(self, user_service, mock_repository):
        # Arrange
        user_data = {
            "telegram_id": 123456789,
            "first_name": "John",
            "last_name": "Doe"
        }
        expected_user = User(**user_data)
        mock_repository.save.return_value = expected_user
        
        # Act
        result = await user_service.create_user(user_data)
        
        # Assert
        assert result == expected_user
        mock_repository.save.assert_called_once()
```

## Отладка

### Frontend отладка

```typescript
// Используйте React DevTools
// Установите расширение в браузере

// Логирование
console.log('Debug info:', data);

// Debugger
debugger;

// React DevTools Profiler
// Для анализа производительности
```

### Backend отладка

```python
# Логирование
import logging

logger = logging.getLogger(__name__)
logger.info("Processing user request")
logger.error("Error occurred", exc_info=True)

# Debugger
import pdb; pdb.set_trace()

# FastAPI debug режим
uvicorn main:app --reload --log-level debug
```

### Docker отладка

```bash
# Просмотр логов
docker-compose logs -f backend

# Подключение к контейнеру
docker-compose exec backend bash

# Проверка переменных окружения
docker-compose exec backend env
```

## Производительность

### Frontend оптимизация

```typescript
// Используйте React.memo для предотвращения лишних рендеров
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Тяжелые вычисления */}</div>;
});

// Используйте useMemo для кэширования вычислений
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Используйте useCallback для стабильных функций
const handleClick = useCallback(() => {
  // Обработка клика
}, [dependencies]);
```

### Backend оптимизация

```python
# Используйте async/await для I/O операций
async def get_user_workouts(user_id: int) -> List[Workout]:
    return await workout_repository.find_by_user_id(user_id)

# Используйте кэширование
from functools import lru_cache

@lru_cache(maxsize=128)
def get_exercise_by_id(exercise_id: int) -> Exercise:
    return exercise_repository.find_by_id(exercise_id)

# Используйте пагинацию
async def get_users(limit: int = 10, offset: int = 0) -> List[User]:
    return await user_repository.find_all(limit=limit, offset=offset)
```

## Безопасность

### Frontend безопасность

```typescript
// Валидация входных данных
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Санитизация данных
import DOMPurify from 'dompurify';

const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html);
};

// Защита от XSS
const userInput = '<script>alert("xss")</script>';
const safeInput = sanitizeHtml(userInput);
```

### Backend безопасность

```python
# Валидация данных с Pydantic
from pydantic import BaseModel, validator

class UserCreate(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    
    @validator('username')
    def validate_username(cls, v):
        if v and len(v) < 3:
            raise ValueError('Username must be at least 3 characters')
        return v

# Rate limiting
from fastapi import HTTPException, Depends
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/users/")
@limiter.limit("5/minute")
async def create_user(request: Request, user_data: UserCreate):
    # Создание пользователя
    pass
```

## Мониторинг и логирование

### Frontend мониторинг

```typescript
// Обработка ошибок
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Отправка в систему мониторинга
});

// Отслеживание производительности
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Performance metric:', entry);
  }
});
observer.observe({ entryTypes: ['navigation', 'resource'] });
```

### Backend мониторинг

```python
# Структурированное логирование
import structlog

logger = structlog.get_logger()

logger.info("User created", 
    user_id=user.id, 
    telegram_id=user.telegram_id
)

# Prometheus метрики
from prometheus_client import Counter, Histogram

http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)
```

## Деплой и CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install frontend dependencies
      run: cd frontend && npm ci
    
    - name: Run frontend tests
      run: cd frontend && npm test
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install backend dependencies
      run: cd backend && pip install -r requirements.txt
    
    - name: Run backend tests
      run: cd backend && pytest
    
    - name: Build and deploy
      if: github.ref == 'refs/heads/main'
      run: |
        # Деплой в продакшен
```

## Полезные инструменты

### Frontend

- **ESLint** - линтинг кода
- **Prettier** - форматирование кода
- **TypeScript** - типизация
- **React DevTools** - отладка React
- **Redux DevTools** - отладка состояния

### Backend

- **Black** - форматирование кода
- **Flake8** - линтинг кода
- **MyPy** - проверка типов
- **Pytest** - тестирование
- **FastAPI** - автогенерация документации

### Общие

- **Git** - контроль версий
- **Docker** - контейнеризация
- **Postman** - тестирование API
- **VS Code** - IDE

## Заключение

Следуйте этим принципам для создания качественного, поддерживаемого кода:

1. **Пишите чистый, читаемый код**
2. **Добавляйте тесты для новой функциональности**
3. **Следуйте принципам SOLID**
4. **Используйте типизацию**
5. **Документируйте код**
6. **Регулярно рефакторите**
7. **Мониторьте производительность**

Удачной разработки! 🚀 