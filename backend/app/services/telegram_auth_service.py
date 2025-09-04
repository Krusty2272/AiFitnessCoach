"""
Telegram авторизация и валидация пользователей
"""

import hashlib
import hmac
import time
import json
from typing import Optional, Dict, Any
from urllib.parse import parse_qs
import structlog

logger = structlog.get_logger()


class TelegramAuthService:
    def __init__(self, bot_token: str):
        """
        Инициализация сервиса авторизации
        
        Args:
            bot_token: Токен бота из BotFather
        """
        self.bot_token = bot_token
        # Создаем секретный ключ для валидации
        self.secret_key = hashlib.sha256(bot_token.encode()).digest()

    def validate_init_data(self, init_data: str) -> Optional[Dict[str, Any]]:
        """
        Валидация данных от Telegram Mini App
        
        Args:
            init_data: Строка с данными от Telegram в формате URL query
            
        Returns:
            Словарь с данными пользователя если валидация прошла успешно
        """
        try:
            # Парсим данные
            parsed_data = parse_qs(init_data)
            
            # Извлекаем hash
            received_hash = parsed_data.get('hash', [None])[0]
            if not received_hash:
                logger.warning("No hash in init data")
                return None
            
            # Создаем строку для проверки (без hash параметра)
            data_check_arr = []
            for key, values in parsed_data.items():
                if key != 'hash':
                    data_check_arr.append(f"{key}={values[0]}")
            
            # Сортируем и объединяем
            data_check_arr.sort()
            data_check_string = '\n'.join(data_check_arr)
            
            # Вычисляем hash
            secret_key = hmac.new(
                b"WebAppData",
                self.bot_token.encode(),
                hashlib.sha256
            ).digest()
            
            calculated_hash = hmac.new(
                secret_key,
                data_check_string.encode(),
                hashlib.sha256
            ).hexdigest()
            
            # Сравниваем hash
            if calculated_hash != received_hash:
                logger.warning("Invalid hash", 
                             received=received_hash[:10],
                             calculated=calculated_hash[:10])
                return None
            
            # Проверяем время (данные действительны 24 часа)
            auth_date = int(parsed_data.get('auth_date', [0])[0])
            if auth_date and (time.time() - auth_date) > 86400:
                logger.warning("Init data expired")
                return None
            
            # Парсим user данные
            user_data = parsed_data.get('user', [None])[0]
            if user_data:
                user = json.loads(user_data)
            else:
                user = None
            
            # Возвращаем валидированные данные
            return {
                'user': user,
                'auth_date': auth_date,
                'query_id': parsed_data.get('query_id', [None])[0],
                'chat_instance': parsed_data.get('chat_instance', [None])[0],
                'chat_type': parsed_data.get('chat_type', [None])[0],
                'start_param': parsed_data.get('start_param', [None])[0],
            }
            
        except Exception as e:
            logger.error(f"Error validating init data: {e}")
            return None

    def extract_user_info(self, validated_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Извлечение информации о пользователе
        
        Args:
            validated_data: Валидированные данные от validate_init_data
            
        Returns:
            Информация о пользователе
        """
        if not validated_data or not validated_data.get('user'):
            return None
        
        user = validated_data['user']
        
        return {
            'telegram_id': user.get('id'),
            'first_name': user.get('first_name'),
            'last_name': user.get('last_name'),
            'username': user.get('username'),
            'language_code': user.get('language_code', 'en'),
            'is_premium': user.get('is_premium', False),
            'photo_url': user.get('photo_url'),
            'allows_write_to_pm': user.get('allows_write_to_pm', True)
        }

    def generate_auth_token(self, user_id: int) -> str:
        """
        Генерация токена авторизации для пользователя
        
        Args:
            user_id: ID пользователя в Telegram
            
        Returns:
            JWT токен или другой токен авторизации
        """
        # Здесь должна быть генерация JWT токена
        # Для простоты используем hash
        timestamp = str(int(time.time()))
        data = f"{user_id}:{timestamp}"
        signature = hmac.new(
            self.secret_key,
            data.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return f"{data}:{signature}"

    def verify_auth_token(self, token: str) -> Optional[int]:
        """
        Проверка токена авторизации
        
        Args:
            token: Токен для проверки
            
        Returns:
            ID пользователя если токен валиден
        """
        try:
            parts = token.split(':')
            if len(parts) != 3:
                return None
            
            user_id, timestamp, signature = parts
            
            # Проверяем подпись
            data = f"{user_id}:{timestamp}"
            expected_signature = hmac.new(
                self.secret_key,
                data.encode(),
                hashlib.sha256
            ).hexdigest()
            
            if signature != expected_signature:
                return None
            
            # Проверяем время (токен действителен 7 дней)
            token_time = int(timestamp)
            if (time.time() - token_time) > 604800:  # 7 дней
                return None
            
            return int(user_id)
            
        except Exception as e:
            logger.error(f"Error verifying token: {e}")
            return None

    def create_deep_link(self, start_param: str = None) -> str:
        """
        Создание deep link для бота
        
        Args:
            start_param: Параметр для передачи в бота
            
        Returns:
            URL для открытия бота
        """
        bot_username = "AIGymCoachBot"  # Замените на username вашего бота
        
        if start_param:
            return f"https://t.me/{bot_username}?start={start_param}"
        return f"https://t.me/{bot_username}"

    def create_webapp_link(self, webapp_url: str) -> str:
        """
        Создание ссылки на Mini App
        
        Args:
            webapp_url: URL вашего веб-приложения
            
        Returns:
            URL для открытия Mini App
        """
        bot_username = "AIGymCoachBot"  # Замените на username вашего бота
        return f"https://t.me/{bot_username}/app"


# Экспорт для использования
def get_telegram_auth_service(bot_token: str) -> TelegramAuthService:
    return TelegramAuthService(bot_token)