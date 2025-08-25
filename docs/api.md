# 📡 API Documentation

## Обзор API

AI Gym Coach предоставляет REST API для взаимодействия с Telegram Mini App. API построен на FastAPI и следует принципам RESTful архитектуры.

## Базовый URL

```
Development: http://localhost:8000
Production: https://your-domain.com
```

## Аутентификация

API использует Telegram WebApp инициализационные данные для аутентификации пользователей.

### Headers

```http
Content-Type: application/json
X-Telegram-Init-Data: <telegram_init_data>
```

## Endpoints

### 1. Health Check

#### GET /health

Проверка состояния сервера.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0"
}
```

### 2. Users

#### GET /api/v1/users/

Получить список пользователей (только для администраторов).

**Query Parameters:**
- `limit` (int, optional): Количество записей (по умолчанию 10)
- `offset` (int, optional): Смещение (по умолчанию 0)

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "telegram_id": 123456789,
      "username": "john_doe",
      "first_name": "John",
      "last_name": "Doe",
      "created_at": "2024-01-01T12:00:00Z",
      "is_active": true
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

#### POST /api/v1/users/

Создать нового пользователя.

**Request Body:**
```json
{
  "telegram_id": 123456789,
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "id": 1,
  "telegram_id": 123456789,
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "created_at": "2024-01-01T12:00:00Z",
  "is_active": true
}
```

#### GET /api/v1/users/{user_id}

Получить пользователя по ID.

**Response:**
```json
{
  "id": 1,
  "telegram_id": 123456789,
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "created_at": "2024-01-01T12:00:00Z",
  "is_active": true,
  "statistics": {
    "total_workouts": 24,
    "consecutive_days": 7,
    "total_hours": 18,
    "favorite_exercise": "Отжимания"
  }
}
```

### 3. Workouts

#### GET /api/v1/workouts/

Получить список тренировок пользователя.

**Query Parameters:**
- `user_id` (int, required): ID пользователя
- `limit` (int, optional): Количество записей
- `offset` (int, optional): Смещение

**Response:**
```json
{
  "workouts": [
    {
      "id": 1,
      "user_id": 1,
      "type": "strength",
      "name": "Тренировка груди и трицепса",
      "duration": 60,
      "created_at": "2024-01-01T12:00:00Z",
      "completed": true,
      "exercises": [
        {
          "id": 1,
          "exercise_id": 1,
          "sets": 3,
          "reps": 12,
          "rest_seconds": 60,
          "order": 1,
          "completed": true,
          "completed_sets": 3,
          "weight": 50,
          "duration_seconds": 0
        }
      ]
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

#### POST /api/v1/workouts/generate/

Сгенерировать новую тренировку.

**Request Body:**
```json
{
  "user_id": 1,
  "workout_type": "strength",
  "muscle_groups": ["chest", "triceps"],
  "duration": 60,
  "difficulty": "intermediate"
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "type": "strength",
  "name": "Тренировка груди и трицепса",
  "duration": 60,
  "created_at": "2024-01-01T12:00:00Z",
  "completed": false,
  "exercises": [
    {
      "id": 1,
      "exercise": {
        "id": 1,
        "name": "Жим лежа",
        "muscle_group": "chest",
        "description": "Базовое упражнение для развития грудных мышц",
        "is_active": true,
        "created_at": "2024-01-01T12:00:00Z"
      },
      "sets": 3,
      "reps": 12,
      "rest_seconds": 60,
      "order": 1,
      "completed": false,
      "completed_sets": 0,
      "weight": 0,
      "duration_seconds": 0
    }
  ]
}
```

#### PUT /api/v1/workouts/{workout_id}

Обновить тренировку.

**Request Body:**
```json
{
  "completed": true,
  "exercises": [
    {
      "id": 1,
      "completed": true,
      "completed_sets": 3,
      "weight": 50
    }
  ]
}
```

#### DELETE /api/v1/workouts/{workout_id}

Удалить тренировку.

### 4. Exercises

#### GET /api/v1/workouts/exercises/

Получить список упражнений.

**Query Parameters:**
- `muscle_group` (str, optional): Фильтр по группе мышц
- `limit` (int, optional): Количество записей
- `offset` (int, optional): Смещение

**Response:**
```json
{
  "exercises": [
    {
      "id": 1,
      "name": "Жим лежа",
      "muscle_group": "chest",
      "description": "Базовое упражнение для развития грудных мышц",
      "is_active": true,
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

#### POST /api/v1/workouts/exercises/

Создать новое упражнение.

**Request Body:**
```json
{
  "name": "Новое упражнение",
  "muscle_group": "chest",
  "description": "Описание упражнения"
}
```

## Модели данных

### User

```typescript
interface User {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  created_at: string;
  is_active: boolean;
  statistics?: UserStatistics;
}

interface UserStatistics {
  total_workouts: number;
  consecutive_days: number;
  total_hours: number;
  favorite_exercise: string;
}
```

### Workout

```typescript
interface Workout {
  id: number;
  user_id: number;
  type: 'strength' | 'cardio' | 'flexibility';
  name: string;
  duration: number;
  created_at: string;
  completed: boolean;
  exercises: WorkoutExercise[];
}

interface WorkoutExercise {
  id: number;
  exercise_id: number;
  exercise?: Exercise;
  sets: number;
  reps: number;
  rest_seconds: number;
  order: number;
  completed: boolean;
  completed_sets: number;
  weight: number;
  duration_seconds: number;
}
```

### Exercise

```typescript
interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  description: string;
  is_active: boolean;
  created_at: string;
}
```

## Коды ошибок

### HTTP Status Codes

- `200` - Успешный запрос
- `201` - Ресурс создан
- `400` - Неверный запрос
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Ресурс не найден
- `422` - Ошибка валидации
- `500` - Внутренняя ошибка сервера

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "username",
        "message": "Username is required"
      }
    ]
  }
}
```

## Rate Limiting

API использует rate limiting для предотвращения злоупотреблений:

- **100 запросов в минуту** для аутентифицированных пользователей
- **10 запросов в минуту** для неаутентифицированных запросов

## WebSocket API

### Подключение

```
ws://localhost:8000/ws/{user_id}
```

### События

#### workout_progress
```json
{
  "event": "workout_progress",
  "data": {
    "workout_id": 1,
    "exercise_id": 1,
    "progress": 0.75
  }
}
```

#### workout_completed
```json
{
  "event": "workout_completed",
  "data": {
    "workout_id": 1,
    "duration": 3600,
    "calories_burned": 450
  }
}
```

## Примеры использования

### JavaScript/TypeScript

```typescript
import { api } from './services/api';

// Получить пользователя
const user = await api.get(`/api/v1/users/${userId}`);

// Создать тренировку
const workout = await api.post('/api/v1/workouts/generate/', {
  user_id: userId,
  workout_type: 'strength',
  muscle_groups: ['chest', 'triceps'],
  duration: 60,
  difficulty: 'intermediate'
});

// Обновить прогресс
await api.put(`/api/v1/workouts/${workoutId}`, {
  completed: true,
  exercises: [
    {
      id: 1,
      completed: true,
      completed_sets: 3,
      weight: 50
    }
  ]
});
```

### Python

```python
import requests

# Получить пользователя
response = requests.get(f"{API_BASE_URL}/api/v1/users/{user_id}")
user = response.json()

# Создать тренировку
workout_data = {
    "user_id": user_id,
    "workout_type": "strength",
    "muscle_groups": ["chest", "triceps"],
    "duration": 60,
    "difficulty": "intermediate"
}
response = requests.post(f"{API_BASE_URL}/api/v1/workouts/generate/", json=workout_data)
workout = response.json()
```

## Мониторинг

### Health Check

```bash
curl http://localhost:8000/health
```

### Metrics (Prometheus)

```bash
curl http://localhost:8000/metrics
```

### API Documentation (Swagger)

```
http://localhost:8000/docs
```

## Версионирование

API использует версионирование в URL:

- `v1` - текущая версия
- `v2` - будущая версия (при необходимости)

При изменении API создается новая версия, старая версия поддерживается для обратной совместимости. 