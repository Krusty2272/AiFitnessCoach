# 🏗️ Архитектура AI Gym Coach

## Обзор архитектуры

AI Gym Coach построен на принципах **Clean Architecture** (Чистой архитектуры) Роберта Мартина, что обеспечивает:

- ✅ **Независимость от фреймворков**
- ✅ **Тестируемость**
- ✅ **Независимость от UI**
- ✅ **Независимость от базы данных**
- ✅ **Независимость от внешних агентов**

## Слои архитектуры

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   React App     │  │  Telegram Bot   │  │   Web API    │ │
│  │   (Frontend)    │  │   Interface     │  │   (REST)     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Use Cases      │  │  Controllers    │  │  Presenters  │ │
│  │  (Business      │  │  (Request/      │  │  (Response   │ │
│  │   Logic)        │  │   Response)     │  │   Format)    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Entities      │  │  Value Objects  │  │  Domain      │ │
│  │  (Core Business │  │  (Business      │  │  Services    │ │
│  │   Objects)      │  │   Rules)        │  │  (Pure Logic)│ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Database      │  │  External APIs  │  │  Frameworks  │ │
│  │  (PostgreSQL/   │  │  (Telegram API, │  │  (FastAPI,   │ │
│  │   SQLite)       │  │   AI Services)  │  │   React)     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Детальное описание слоев

### 1. Presentation Layer (Слой представления)

**Ответственность**: Взаимодействие с пользователем

**Компоненты**:
- **React App** - веб-интерфейс
- **Telegram Bot Interface** - интерфейс бота
- **Web API** - REST API endpoints

**Принципы**:
- Не содержит бизнес-логики
- Только отображение данных и обработка пользовательского ввода
- Зависит только от Application Layer

### 2. Application Layer (Слой приложения)

**Ответственность**: Оркестрация бизнес-процессов

**Компоненты**:
- **Use Cases** - основные сценарии использования
- **Controllers** - обработка запросов
- **Presenters** - форматирование ответов

**Принципы**:
- Содержит бизнес-логику приложения
- Координирует работу domain entities
- Не зависит от внешних систем

### 3. Domain Layer (Слой домена)

**Ответственность**: Бизнес-логика и правила

**Компоненты**:
- **Entities** - основные бизнес-объекты (User, Workout, Exercise)
- **Value Objects** - неизменяемые объекты (Email, WorkoutType)
- **Domain Services** - сложная бизнес-логика

**Принципы**:
- Самая внутренняя часть системы
- Не зависит от внешних слоев
- Содержит только бизнес-правила

### 4. Infrastructure Layer (Слой инфраструктуры)

**Ответственность**: Внешние зависимости и технические детали

**Компоненты**:
- **Database** - хранение данных
- **External APIs** - внешние сервисы
- **Frameworks** - технические фреймворки

**Принципы**:
- Самый внешний слой
- Реализует интерфейсы, определенные внутренними слоями
- Содержит все технические детали

## Структура проекта

### Frontend (Presentation Layer)

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

### Backend (Application + Domain + Infrastructure Layers)

```
backend/app/
├── api/                 # Presentation Layer (API)
│   ├── __init__.py
│   ├── dependencies.py  # Зависимости API
│   └── v1/             # API версионирование
│       ├── __init__.py
│       ├── api.py      # Основной роутер
│       └── endpoints/  # API endpoints
│           ├── users.py
│           ├── workouts.py
│           └── exercises.py
├── application/         # Application Layer
│   ├── __init__.py
│   ├── use_cases/      # Use Cases
│   │   ├── user_use_cases.py
│   │   ├── workout_use_cases.py
│   │   └── exercise_use_cases.py
│   ├── services/       # Application Services
│   │   ├── user_service.py
│   │   ├── workout_service.py
│   │   └── exercise_service.py
│   └── interfaces/     # Интерфейсы
│       ├── repositories.py
│       └── services.py
├── domain/             # Domain Layer
│   ├── __init__.py
│   ├── entities/       # Domain Entities
│   │   ├── user.py
│   │   ├── workout.py
│   │   └── exercise.py
│   ├── value_objects/  # Value Objects
│   │   ├── email.py
│   │   ├── workout_type.py
│   │   └── muscle_group.py
│   ├── services/       # Domain Services
│   │   └── workout_generator.py
│   └── repositories/   # Repository Interfaces
│       ├── user_repository.py
│       ├── workout_repository.py
│       └── exercise_repository.py
├── infrastructure/     # Infrastructure Layer
│   ├── __init__.py
│   ├── database/       # Database
│   │   ├── models.py
│   │   ├── repositories.py
│   │   └── migrations/
│   ├── external/       # External Services
│   │   ├── telegram_api.py
│   │   └── ai_service.py
│   └── config/         # Configuration
│       ├── database.py
│       └── settings.py
└── core/               # Core Configuration
    ├── __init__.py
    ├── config.py       # Основная конфигурация
    ├── database.py     # Database connection
    └── security.py     # Security utilities
```

## Принципы проектирования

### 1. Dependency Inversion Principle (DIP)

```python
# ❌ Плохо - зависимость от конкретной реализации
class UserService:
    def __init__(self):
        self.repository = PostgreSQLUserRepository()

# ✅ Хорошо - зависимость от абстракции
class UserService:
    def __init__(self, repository: UserRepository):
        self.repository = repository
```

### 2. Single Responsibility Principle (SRP)

```python
# ❌ Плохо - много ответственностей
class WorkoutManager:
    def create_workout(self): pass
    def save_to_database(self): pass
    def send_notification(self): pass
    def generate_report(self): pass

# ✅ Хорошо - одна ответственность
class WorkoutService:
    def create_workout(self): pass

class WorkoutRepository:
    def save(self): pass

class NotificationService:
    def send(self): pass
```

### 3. Open/Closed Principle (OCP)

```python
# ✅ Расширяемо без изменения
class WorkoutGenerator:
    def __init__(self, strategies: List[WorkoutStrategy]):
        self.strategies = strategies
    
    def generate(self, user_preferences):
        for strategy in self.strategies:
            if strategy.can_apply(user_preferences):
                return strategy.generate(user_preferences)
```

## Паттерны проектирования

### 1. Repository Pattern

```python
# Интерфейс
class UserRepository(ABC):
    @abstractmethod
    def save(self, user: User) -> User:
        pass
    
    @abstractmethod
    def find_by_id(self, user_id: int) -> Optional[User]:
        pass

# Реализация
class SQLAlchemyUserRepository(UserRepository):
    def __init__(self, session: Session):
        self.session = session
    
    def save(self, user: User) -> User:
        self.session.add(user)
        self.session.commit()
        return user
```

### 2. Use Case Pattern

```python
class CreateWorkoutUseCase:
    def __init__(
        self,
        workout_repository: WorkoutRepository,
        user_repository: UserRepository,
        workout_generator: WorkoutGenerator
    ):
        self.workout_repository = workout_repository
        self.user_repository = user_repository
        self.workout_generator = workout_generator
    
    def execute(self, user_id: int, preferences: WorkoutPreferences) -> Workout:
        user = self.user_repository.find_by_id(user_id)
        if not user:
            raise UserNotFoundError()
        
        workout = self.workout_generator.generate(preferences)
        workout.user_id = user_id
        
        return self.workout_repository.save(workout)
```

### 3. Factory Pattern

```python
class WorkoutFactory:
    @staticmethod
    def create_strength_workout(exercises: List[Exercise]) -> Workout:
        return Workout(
            type=WorkoutType.STRENGTH,
            exercises=exercises,
            duration=60
        )
    
    @staticmethod
    def create_cardio_workout(duration: int) -> Workout:
        return Workout(
            type=WorkoutType.CARDIO,
            exercises=[],
            duration=duration
        )
```

## Преимущества архитектуры

### 1. Тестируемость
- Каждый слой можно тестировать независимо
- Легко создавать моки и стабы
- Высокое покрытие тестами

### 2. Гибкость
- Легко заменить технологии
- Простое добавление новых функций
- Независимость от фреймворков

### 3. Поддерживаемость
- Четкое разделение ответственности
- Легко понимать и изменять код
- Меньше связанности между компонентами

### 4. Масштабируемость
- Можно масштабировать слои независимо
- Легко добавлять новые интерфейсы
- Поддержка микросервисной архитектуры

## Заключение

Clean Architecture обеспечивает создание надежного, тестируемого и поддерживаемого приложения. Следование принципам SOLID и использование проверенных паттернов проектирования позволяет создавать качественный код, который легко развивать и поддерживать. 