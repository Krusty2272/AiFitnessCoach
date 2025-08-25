#!/usr/bin/env python3
"""
Скрипт для автоматического развертывания в Telegram
"""

import subprocess
import time
import requests
import json
import os
import sys
from typing import Optional

class TelegramDeployer:
    def __init__(self):
        self.ngrok_process = None
        self.backend_process = None
        self.frontend_process = None
        self.ngrok_url = None
        
    def check_ngrok(self) -> bool:
        """Проверить, установлен ли ngrok"""
        try:
            result = subprocess.run(["ngrok", "version"], capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ ngrok найден")
                return True
        except FileNotFoundError:
            pass
        
        print("❌ ngrok не найден!")
        print("📥 Установите ngrok:")
        print("   1. Скачайте с https://ngrok.com/download")
        print("   2. Распакуйте в папку PATH")
        print("   3. Зарегистрируйтесь на https://ngrok.com")
        print("   4. Добавьте токен: ngrok config add-authtoken YOUR_TOKEN")
        return False
    
    def start_ngrok(self, port: int = 8000) -> Optional[str]:
        """Запустить ngrok туннель"""
        if not self.check_ngrok():
            return None
            
        print(f"🚀 Запуск ngrok туннеля для порта {port}...")
        
        try:
            # Запускаем ngrok в фоне
            self.ngrok_process = subprocess.Popen(
                ["ngrok", "http", str(port), "--log=stdout"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Ждем запуска и получаем URL
            time.sleep(3)
            
            # Получаем URL через ngrok API
            try:
                response = requests.get("http://localhost:4040/api/tunnels", timeout=5)
                if response.status_code == 200:
                    tunnels = response.json()["tunnels"]
                    for tunnel in tunnels:
                        if tunnel["proto"] == "https":
                            self.ngrok_url = tunnel["public_url"]
                            print(f"✅ ngrok туннель запущен: {self.ngrok_url}")
                            return self.ngrok_url
            except Exception as e:
                print(f"⚠️ Не удалось получить URL через API: {e}")
                
            # Альтернативный способ - парсим вывод
            time.sleep(2)
            if self.ngrok_process.poll() is None:
                print("✅ ngrok запущен (проверьте URL в браузере: http://localhost:4040)")
                return "https://your-ngrok-url.ngrok.io"  # Замените на реальный URL
            else:
                print("❌ Ошибка запуска ngrok")
                return None
                
        except Exception as e:
            print(f"❌ Ошибка запуска ngrok: {e}")
            return None
    
    def start_backend(self) -> bool:
        """Запустить backend сервер"""
        print("🚀 Запуск backend сервера...")
        
        try:
            self.backend_process = subprocess.Popen(
                [sys.executable, "backend/mock_server.py"],
                cwd=os.getcwd(),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Ждем запуска
            time.sleep(3)
            
            # Проверяем, что сервер запустился
            try:
                response = requests.get("http://localhost:8000/health", timeout=5)
                if response.status_code == 200:
                    print("✅ Backend сервер запущен")
                    return True
            except Exception as e:
                print(f"⚠️ Не удалось проверить backend: {e}")
            
            return self.backend_process.poll() is None
            
        except Exception as e:
            print(f"❌ Ошибка запуска backend: {e}")
            return False
    
    def start_frontend(self) -> bool:
        """Запустить frontend сервер"""
        print("🚀 Запуск frontend сервера...")
        
        try:
            self.frontend_process = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd="frontend",
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Ждем запуска
            time.sleep(5)
            
            # Проверяем, что сервер запустился
            try:
                response = requests.get("http://localhost:3000", timeout=5)
                if response.status_code == 200:
                    print("✅ Frontend сервер запущен")
                    return True
            except Exception as e:
                print(f"⚠️ Не удалось проверить frontend: {e}")
            
            return self.frontend_process.poll() is None
            
        except Exception as e:
            print(f"❌ Ошибка запуска frontend: {e}")
            return False
    
    def setup_telegram_bot(self) -> bool:
        """Настроить Telegram бота"""
        if not self.ngrok_url:
            print("❌ ngrok URL не получен!")
            return False
            
        print("🤖 Настройка Telegram бота...")
        print(f"📱 Frontend URL: {self.ngrok_url.replace('https://', 'https://')}")
        print(f"🔗 Backend URL: {self.ngrok_url}")
        
        # Создаем конфигурацию
        config = {
            "bot_token": "YOUR_BOT_TOKEN",  # Замените на реальный токен
            "webhook_url": self.ngrok_url,
            "frontend_url": self.ngrok_url.replace("https://", "https://")
        }
        
        with open("telegram_config.json", "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        
        print("✅ Конфигурация сохранена")
        print("\n📋 СЛЕДУЮЩИЕ ШАГИ:")
        print("1. Откройте @BotFather в Telegram")
        print("2. Создайте бота: /newbot")
        print("3. Скопируйте токен и замените 'YOUR_BOT_TOKEN' в telegram_config.json")
        print("4. Создайте Mini App: /newapp")
        print("5. Укажите URL: " + self.ngrok_url)
        print("6. Перезапустите backend сервер")
        
        return True
    
    def show_status(self):
        """Показать статус сервисов"""
        print("\n📊 СТАТУС СЕРВИСОВ:")
        print("=" * 40)
        
        # ngrok
        if self.ngrok_process and self.ngrok_process.poll() is None:
            print("✅ ngrok: Запущен")
            if self.ngrok_url:
                print(f"   URL: {self.ngrok_url}")
        else:
            print("❌ ngrok: Не запущен")
        
        # backend
        if self.backend_process and self.backend_process.poll() is None:
            print("✅ Backend: Запущен (порт 8000)")
        else:
            print("❌ Backend: Не запущен")
        
        # frontend
        if self.frontend_process and self.frontend_process.poll() is None:
            print("✅ Frontend: Запущен (порт 3000)")
        else:
            print("❌ Frontend: Не запущен")
        
        print("\n🌐 ДОСТУПНЫЕ URL:")
        print(f"   Frontend: http://localhost:3000")
        print(f"   Backend: http://localhost:8000")
        print(f"   ngrok Dashboard: http://localhost:4040")
        if self.ngrok_url:
            print(f"   Public URL: {self.ngrok_url}")
    
    def stop_all(self):
        """Остановить все сервисы"""
        print("\n🛑 Остановка сервисов...")
        
        if self.ngrok_process:
            self.ngrok_process.terminate()
            print("✅ ngrok остановлен")
        
        if self.backend_process:
            self.backend_process.terminate()
            print("✅ Backend остановлен")
        
        if self.frontend_process:
            self.frontend_process.terminate()
            print("✅ Frontend остановлен")
    
    def run(self):
        """Запустить полное развертывание"""
        print("🚀 РАЗВЕРТЫВАНИЕ В TELEGRAM")
        print("=" * 50)
        
        try:
            # Запускаем ngrok
            if not self.start_ngrok():
                return False
            
            # Запускаем backend
            if not self.start_backend():
                return False
            
            # Запускаем frontend
            if not self.start_frontend():
                return False
            
            # Настраиваем Telegram бота
            self.setup_telegram_bot()
            
            # Показываем статус
            self.show_status()
            
            print("\n🎉 РАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО!")
            print("=" * 50)
            print("Теперь настройте Telegram бота и протестируйте приложение!")
            
            # Ждем завершения
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n👋 Завершение работы...")
                self.stop_all()
            
        except Exception as e:
            print(f"❌ Ошибка развертывания: {e}")
            self.stop_all()
            return False

def main():
    deployer = TelegramDeployer()
    deployer.run()

if __name__ == "__main__":
    main() 