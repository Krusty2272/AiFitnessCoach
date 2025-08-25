from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import json
import os

app = FastAPI(title="AI Gym Coach Mock API", version="1.0.0")

# CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Загрузка конфигурации Telegram
def load_telegram_config():
    try:
        if os.path.exists("telegram_config.json"):
            with open("telegram_config.json", "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        print(f"Ошибка загрузки конфигурации: {e}")
    return {}

telegram_config = load_telegram_config()

# Mock данные
mock_exercises = [
    {
        "id": 1,
        "name": "Отжимания",
        "muscle_group": "Грудь",
        "description": "Классические отжимания от пола",
        "difficulty": "Средний",
        "equipment": "Нет",
        "instructions": "Примите упор лежа, опуститесь до касания грудью пола, поднимитесь"
    },
    {
        "id": 2,
        "name": "Приседания",
        "muscle_group": "Ноги",
        "description": "Классические приседания",
        "difficulty": "Легкий",
        "equipment": "Нет",
        "instructions": "Поставьте ноги на ширине плеч, присядьте до параллели бедер с полом"
    },
    {
        "id": 3,
        "name": "Планка",
        "muscle_group": "Кор",
        "description": "Статическое упражнение для укрепления кора",
        "difficulty": "Средний",
        "equipment": "Нет",
        "instructions": "Примите упор лежа на предплечьях, держите тело прямым"
    }
]

mock_workouts = [
    {
        "id": 1,
        "name": "Утренняя зарядка",
        "type": "Кардио",
        "duration": 15,
        "difficulty": "Легкий",
        "exercises": [
            {
                "exercise": mock_exercises[0],
                "sets": 3,
                "reps": 10,
                "rest_time": 60
            },
            {
                "exercise": mock_exercises[1],
                "sets": 3,
                "reps": 15,
                "rest_time": 60
            }
        ]
    }
]

mock_users = [
    {
        "id": 1,
        "telegram_id": 123456789,
        "username": "testuser",
        "first_name": "Test",
        "last_name": "User",
        "level": "Начинающий",
        "total_workouts": 5,
        "total_exercises": 25
    }
]

# Pydantic модели
class Exercise(BaseModel):
    id: int
    name: str
    muscle_group: str
    description: str
    difficulty: str
    equipment: str
    instructions: str

class WorkoutExercise(BaseModel):
    exercise: Exercise
    sets: int
    reps: int
    rest_time: int

class Workout(BaseModel):
    id: int
    name: str
    type: str
    duration: int
    difficulty: str
    exercises: List[WorkoutExercise]

class User(BaseModel):
    id: int
    telegram_id: int
    username: str
    first_name: str
    last_name: str
    level: str
    total_workouts: int
    total_exercises: int

class TelegramUpdate(BaseModel):
    update_id: int
    message: Optional[Dict[str, Any]] = None
    callback_query: Optional[Dict[str, Any]] = None

# Telegram Bot API функции
def send_telegram_message(chat_id: int, text: str, reply_markup: Optional[Dict] = None):
    """Отправить сообщение в Telegram"""
    if not telegram_config.get("bot_token"):
        print(f"Бот токен не настроен. Сообщение: {text}")
        return
    
    url = f"https://api.telegram.org/bot{telegram_config['bot_token']}/sendMessage"
    data = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }
    
    if reply_markup:
        data["reply_markup"] = reply_markup
    
    try:
        import requests
        response = requests.post(url, json=data, timeout=10)
        return response.json()
    except Exception as e:
        print(f"Ошибка отправки сообщения: {e}")

def create_inline_keyboard(buttons: List[List[Dict[str, str]]]) -> Dict[str, List]:
    """Создать inline клавиатуру"""
    return {
        "inline_keyboard": buttons
    }

# API endpoints
@app.get("/")
async def root():
    return {"message": "AI Gym Coach Mock API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "mock-api"}

@app.get("/api/v1/users/", response_model=List[User])
async def get_users():
    return mock_users

@app.post("/api/v1/users/", response_model=User)
async def create_user(user: User):
    # Просто возвращаем первого пользователя
    return mock_users[0]

@app.get("/api/v1/users/{user_id}", response_model=User)
async def get_user(user_id: int):
    if user_id == 1:
        return mock_users[0]
    raise HTTPException(status_code=404, detail="User not found")

@app.get("/api/v1/workouts/exercises/", response_model=List[Exercise])
async def get_exercises():
    return mock_exercises

@app.get("/api/v1/workouts/", response_model=List[Workout])
async def get_workouts():
    return mock_workouts

@app.post("/api/v1/workouts/generate/", response_model=Workout)
async def generate_workout():
    # Возвращаем mock тренировку
    return mock_workouts[0]

@app.get("/api/v1/workouts/{workout_id}", response_model=Workout)
async def get_workout(workout_id: int):
    if workout_id == 1:
        return mock_workouts[0]
    raise HTTPException(status_code=404, detail="Workout not found")

@app.post("/api/v1/workouts/{workout_id}/start")
async def start_workout(workout_id: int):
    return {"message": f"Workout {workout_id} started", "status": "active"}

@app.post("/api/v1/workouts/{workout_id}/complete")
async def complete_workout(workout_id: int):
    return {"message": f"Workout {workout_id} completed", "status": "completed"}

# Telegram webhook endpoint
@app.post("/webhook")
async def telegram_webhook(request: Request):
    try:
        data = await request.json()
        update = TelegramUpdate(**data)
        
        # Обработка сообщений
        if update.message:
            message = update.message
            chat_id = message["chat"]["id"]
            text = message.get("text", "")
            
            if text == "/start":
                welcome_text = """
🤖 <b>AI Gym Coach</b> - ваш персональный фитнес-помощник!

💪 <b>Возможности:</b>
• Генерация персональных тренировок
• Отслеживание прогресса
• Рекомендации по упражнениям
• Статистика тренировок

📱 <b>Откройте Mini App</b> для полного доступа к функциям!
                """
                
                keyboard = create_inline_keyboard([
                    [{"text": "🚀 Открыть приложение", "web_app": {"url": telegram_config.get("frontend_url", "http://localhost:3000")}}],
                    [{"text": "💪 Сгенерировать тренировку", "callback_data": "generate_workout"}],
                    [{"text": "📊 Моя статистика", "callback_data": "show_stats"}]
                ])
                
                send_telegram_message(chat_id, welcome_text, keyboard)
                
            elif text == "/help":
                help_text = """
📚 <b>Доступные команды:</b>

/start - Начать работу с ботом
/help - Показать эту справку
/app - Открыть Mini App
/generate - Сгенерировать тренировку
/stats - Показать статистику

💡 <b>Совет:</b> Используйте кнопки для быстрого доступа к функциям!
                """
                send_telegram_message(chat_id, help_text)
                
            elif text == "/app":
                keyboard = create_inline_keyboard([
                    [{"text": "🚀 Открыть AI Gym Coach", "web_app": {"url": telegram_config.get("frontend_url", "http://localhost:3000")}}]
                ])
                send_telegram_message(chat_id, "📱 Откройте Mini App для полного доступа к функциям!", keyboard)
                
            elif text == "/generate":
                workout = mock_workouts[0]
                workout_text = f"""
💪 <b>Сгенерирована тренировка:</b>

🏃‍♂️ <b>{workout['name']}</b>
⏱️ Длительность: {workout['duration']} мин
🎯 Тип: {workout['type']}
📊 Сложность: {workout['difficulty']}

<b>Упражнения:</b>
"""
                for i, exercise_data in enumerate(workout['exercises'], 1):
                    exercise = exercise_data['exercise']
                    workout_text += f"{i}. <b>{exercise['name']}</b> - {exercise_data['sets']}x{exercise_data['reps']}\n"
                
                keyboard = create_inline_keyboard([
                    [{"text": "🚀 Открыть в приложении", "web_app": {"url": telegram_config.get("frontend_url", "http://localhost:3000")}}],
                    [{"text": "💪 Начать тренировку", "callback_data": "start_workout"}]
                ])
                
                send_telegram_message(chat_id, workout_text, keyboard)
                
            elif text == "/stats":
                user = mock_users[0]
                stats_text = f"""
📊 <b>Ваша статистика:</b>

👤 <b>{user['first_name']} {user['last_name']}</b>
🏆 Уровень: {user['level']}
💪 Всего тренировок: {user['total_workouts']}
🎯 Всего упражнений: {user['total_exercises']}

📈 <b>Прогресс:</b>
• Неделя: +3 тренировки
• Месяц: +12 тренировок
• Год: +45 тренировок
                """
                
                keyboard = create_inline_keyboard([
                    [{"text": "📱 Подробная статистика", "web_app": {"url": telegram_config.get("frontend_url", "http://localhost:3000")}}],
                    [{"text": "🎯 Новые цели", "callback_data": "set_goals"}]
                ])
                
                send_telegram_message(chat_id, stats_text, keyboard)
        
        # Обработка callback query
        elif update.callback_query:
            callback_query = update.callback_query
            chat_id = callback_query["message"]["chat"]["id"]
            data = callback_query.get("data", "")
            
            if data == "generate_workout":
                workout = mock_workouts[0]
                workout_text = f"💪 <b>Сгенерирована тренировка:</b>\n\n🏃‍♂️ {workout['name']}\n⏱️ {workout['duration']} мин"
                keyboard = create_inline_keyboard([
                    [{"text": "🚀 Открыть в приложении", "web_app": {"url": telegram_config.get("frontend_url", "http://localhost:3000")}}]
                ])
                send_telegram_message(chat_id, workout_text, keyboard)
                
            elif data == "show_stats":
                user = mock_users[0]
                stats_text = f"📊 <b>Статистика:</b>\n\n💪 Тренировок: {user['total_workouts']}\n🎯 Упражнений: {user['total_exercises']}"
                keyboard = create_inline_keyboard([
                    [{"text": "📱 Подробнее", "web_app": {"url": telegram_config.get("frontend_url", "http://localhost:3000")}}]
                ])
                send_telegram_message(chat_id, stats_text, keyboard)
        
        return {"status": "ok"}
        
    except Exception as e:
        print(f"Ошибка обработки webhook: {e}")
        return {"status": "error", "message": str(e)}

# Статический файл для фронтенда (если нужно)
@app.get("/app", response_class=HTMLResponse)
async def serve_frontend():
    """Сервировать фронтенд приложение"""
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>AI Gym Coach</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
    </head>
    <body>
        <div id="root">
            <h1>AI Gym Coach</h1>
            <p>Приложение загружается...</p>
        </div>
        <script>
            // Редирект на фронтенд
            window.location.href = 'http://localhost:3000';
        </script>
    </body>
    </html>
    """)

if __name__ == "__main__":
    print("🚀 Запуск Mock API сервера с поддержкой Telegram...")
    print("📍 URL: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("🔧 Health Check: http://localhost:8000/health")
    print("🤖 Telegram Webhook: http://localhost:8000/webhook")
    
    if telegram_config:
        print(f"✅ Telegram конфигурация загружена")
        print(f"   Bot: {telegram_config.get('bot_token', 'Не настроен')[:10]}...")
        print(f"   Webhook: {telegram_config.get('webhook_url', 'Не настроен')}")
    else:
        print("⚠️ Telegram конфигурация не найдена")
        print("   Запустите setup_telegram_bot.py для настройки")
    
    print("\n" + "="*50)
    
    uvicorn.run(
        "mock_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 