#!/usr/bin/env python3
"""
Скрипт для настройки Telegram бота и Mini App
"""

import requests
import json
import os
from typing import Optional

class TelegramBotSetup:
    def __init__(self):
        self.bot_token = None
        self.webhook_url = None
        
    def get_bot_token(self) -> Optional[str]:
        """Получить токен бота от пользователя"""
        print("🤖 НАСТРОЙКА TELEGRAM БОТА")
        print("=" * 50)
        print("1. Откройте @BotFather в Telegram")
        print("2. Отправьте команду /newbot")
        print("3. Выберите имя для бота (например: AI Gym Coach)")
        print("4. Выберите username для бота (например: aigymcoach_bot)")
        print("5. Скопируйте полученный токен")
        print()
        
        token = input("Введите токен бота: ").strip()
        if token and token.startswith("5"):
            self.bot_token = token
            return token
        else:
            print("❌ Неверный формат токена!")
            return None
    
    def get_webhook_url(self) -> Optional[str]:
        """Получить URL для webhook"""
        print("\n🌐 НАСТРОЙКА WEBHOOK")
        print("=" * 50)
        print("Для работы в реальном Telegram нужно сделать приложение доступным извне.")
        print("Рекомендуется использовать ngrok:")
        print("1. Установите ngrok: https://ngrok.com/download")
        print("2. Запустите: ngrok http 8000")
        print("3. Скопируйте HTTPS URL (например: https://abc123.ngrok.io)")
        print()
        
        url = input("Введите HTTPS URL для webhook: ").strip()
        if url and url.startswith("https://"):
            self.webhook_url = url
            return url
        else:
            print("❌ Неверный формат URL! Должен начинаться с https://")
            return None
    
    def test_bot_connection(self) -> bool:
        """Проверить подключение к боту"""
        if not self.bot_token:
            return False
            
        url = f"https://api.telegram.org/bot{self.bot_token}/getMe"
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                bot_info = response.json()
                print(f"✅ Бот подключен: @{bot_info['result']['username']}")
                return True
            else:
                print(f"❌ Ошибка подключения: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Ошибка подключения: {e}")
            return False
    
    def set_webhook(self) -> bool:
        """Установить webhook для бота"""
        if not self.bot_token or not self.webhook_url:
            return False
            
        webhook_url = f"{self.webhook_url}/webhook"
        url = f"https://api.telegram.org/bot{self.bot_token}/setWebhook"
        
        try:
            response = requests.post(url, json={
                "url": webhook_url,
                "allowed_updates": ["message", "callback_query"]
            }, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if result.get("ok"):
                    print(f"✅ Webhook установлен: {webhook_url}")
                    return True
                else:
                    print(f"❌ Ошибка установки webhook: {result.get('description')}")
                    return False
            else:
                print(f"❌ Ошибка HTTP: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Ошибка установки webhook: {e}")
            return False
    
    def create_mini_app(self) -> bool:
        """Создать Mini App через BotFather"""
        if not self.bot_token:
            return False
            
        print("\n📱 НАСТРОЙКА MINI APP")
        print("=" * 50)
        print("1. Откройте @BotFather в Telegram")
        print("2. Отправьте команду /newapp")
        print("3. Выберите вашего бота")
        print("4. Введите название Mini App (например: AI Gym Coach)")
        print("5. Введите короткое описание")
        print("6. Загрузите иконку (квадратное изображение)")
        print("7. Введите URL приложения:")
        print(f"   {self.webhook_url.replace('/webhook', '')}")
        print("8. Скопируйте полученный App ID")
        print()
        
        app_id = input("Введите App ID: ").strip()
        if app_id:
            print(f"✅ Mini App создан с ID: {app_id}")
            return True
        else:
            print("❌ App ID не введен!")
            return False
    
    def save_config(self):
        """Сохранить конфигурацию"""
        config = {
            "bot_token": self.bot_token,
            "webhook_url": self.webhook_url,
            "frontend_url": self.webhook_url.replace("/webhook", "") if self.webhook_url else None
        }
        
        with open("telegram_config.json", "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        
        print("\n💾 Конфигурация сохранена в telegram_config.json")
    
    def run_setup(self):
        """Запустить полную настройку"""
        print("🚀 НАСТРОЙКА TELEGRAM БОТА И MINI APP")
        print("=" * 60)
        
        # Получить токен бота
        if not self.get_bot_token():
            return False
        
        # Проверить подключение
        if not self.test_bot_connection():
            return False
        
        # Получить webhook URL
        if not self.get_webhook_url():
            return False
        
        # Установить webhook
        if not self.set_webhook():
            return False
        
        # Создать Mini App
        if not self.create_mini_app():
            return False
        
        # Сохранить конфигурацию
        self.save_config()
        
        print("\n🎉 НАСТРОЙКА ЗАВЕРШЕНА!")
        print("=" * 60)
        print("Теперь вы можете:")
        print("1. Открыть вашего бота в Telegram")
        print("2. Нажать кнопку 'Start' или отправить /start")
        print("3. Использовать команду /app для открытия Mini App")
        print("4. Тестировать приложение в реальном Telegram!")
        
        return True

def main():
    setup = TelegramBotSetup()
    setup.run_setup()

if __name__ == "__main__":
    main() 