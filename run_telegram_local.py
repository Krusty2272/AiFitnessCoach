#!/usr/bin/env python3
"""
Скрипт для запуска приложения в Telegram с localtunnel
"""

import subprocess
import time
import requests
import json
import os
import sys
from typing import Optional

class TelegramLocalRunner:
    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.tunnel_process = None
        self.tunnel_url = None
        
    def check_localtunnel(self) -> bool:
        """Проверить, установлен ли localtunnel"""
        try:
            result = subprocess.run(["lt", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ localtunnel найден")
                return True
        except FileNotFoundError:
            pass
        
        print("❌ localtunnel не найден!")
        print("📥 Установите localtunnel:")
        print("   npm install -g localtunnel")
        return False
    
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
                    print("✅ Backend сервер запущен на http://localhost:8000")
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
                    print("✅ Frontend сервер запущен на http://localhost:3000")
                    return True
            except Exception as e:
                print(f"⚠️ Не удалось проверить frontend: {e}")
            
            return self.frontend_process.poll() is None
            
        except Exception as e:
            print(f"❌ Ошибка запуска frontend: {e}")
            return False
    
    def start_tunnel(self) -> Optional[str]:
        """Запустить localtunnel туннель"""
        if not self.check_localtunnel():
            return None
            
        print("🚀 Запуск localtunnel туннеля...")
        
        try:
            # Запускаем localtunnel в фоне
            self.tunnel_process = subprocess.Popen(
                ["lt", "--port", "8000", "--subdomain", "aigym-coach"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Ждем запуска и получаем URL
            time.sleep(5)
            
            # Парсим вывод localtunnel для получения URL
            if self.tunnel_process.poll() is None:
                # localtunnel обычно выводит URL в stdout
                output = self.tunnel_process.stdout.readline() if self.tunnel_process.stdout else ""
                if "https://" in output:
                    self.tunnel_url = output.strip()
                    print(f"✅ localtunnel запущен: {self.tunnel_url}")
                    return self.tunnel_url
                else:
                    # Альтернативный способ - проверить через API
                    try:
                        response = requests.get("http://localhost:4040/api/tunnels", timeout=5)
                        if response.status_code == 200:
                            tunnels = response.json()["tunnels"]
                            for tunnel in tunnels:
                                if tunnel["proto"] == "https":
                                    self.tunnel_url = tunnel["public_url"]
                                    print(f"✅ localtunnel запущен: {self.tunnel_url}")
                                    return self.tunnel_url
                    except:
                        pass
                    
                    # Если не удалось получить URL автоматически
                    self.tunnel_url = "https://aigym-coach.loca.lt"
                    print(f"✅ localtunnel запущен (предполагаемый URL): {self.tunnel_url}")
                    print("   Проверьте реальный URL в выводе localtunnel")
                    return self.tunnel_url
            else:
                print("❌ Ошибка запуска localtunnel")
                return None
                
        except Exception as e:
            print(f"❌ Ошибка запуска localtunnel: {e}")
            return None
    
    def setup_telegram_bot(self) -> bool:
        """Настроить Telegram бота"""
        if not self.tunnel_url:
            print("❌ Tunnel URL не получен!")
            return False
            
        print("🤖 Настройка Telegram бота...")
        print(f"🔗 Backend URL: {self.tunnel_url}")
        print(f"📱 Frontend URL: {self.tunnel_url}")
        
        # Создаем конфигурацию
        config = {
            "bot_token": "YOUR_BOT_TOKEN",  # Замените на реальный токен
            "webhook_url": self.tunnel_url,
            "frontend_url": self.tunnel_url
        }
        
        with open("telegram_config.json", "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        
        print("✅ Конфигурация сохранена в telegram_config.json")
        print("\n📋 СЛЕДУЮЩИЕ ШАГИ:")
        print("1. Откройте @BotFather в Telegram")
        print("2. Создайте бота: /newbot")
        print("3. Скопируйте токен и замените 'YOUR_BOT_TOKEN' в telegram_config.json")
        print("4. Создайте Mini App: /newapp")
        print("5. Укажите URL: " + self.tunnel_url)
        print("6. Перезапустите backend сервер")
        
        return True
    
    def show_status(self):
        """Показать статус сервисов"""
        print("\n📊 СТАТУС СЕРВИСОВ:")
        print("=" * 40)
        
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
        
        # tunnel
        if self.tunnel_process and self.tunnel_process.poll() is None:
            print("✅ localtunnel: Запущен")
            if self.tunnel_url:
                print(f"   URL: {self.tunnel_url}")
        else:
            print("❌ localtunnel: Не запущен")
        
        print("\n🌐 ДОСТУПНЫЕ URL:")
        print(f"   Frontend: http://localhost:3000")
        print(f"   Backend: http://localhost:8000")
        if self.tunnel_url:
            print(f"   Public URL: {self.tunnel_url}")
    
    def stop_all(self):
        """Остановить все сервисы"""
        print("\n🛑 Остановка сервисов...")
        
        if self.tunnel_process:
            self.tunnel_process.terminate()
            print("✅ localtunnel остановлен")
        
        if self.backend_process:
            self.backend_process.terminate()
            print("✅ Backend остановлен")
        
        if self.frontend_process:
            self.frontend_process.terminate()
            print("✅ Frontend остановлен")
    
    def run(self):
        """Запустить полное развертывание"""
        print("🚀 ЗАПУСК В TELEGRAM С LOCALTUNNEL")
        print("=" * 50)
        
        try:
            # Запускаем backend
            if not self.start_backend():
                return False
            
            # Запускаем frontend
            if not self.start_frontend():
                return False
            
            # Запускаем tunnel
            if not self.start_tunnel():
                print("⚠️ Продолжаем без туннеля (только локальное тестирование)")
            
            # Настраиваем Telegram бота
            if self.tunnel_url:
                self.setup_telegram_bot()
            
            # Показываем статус
            self.show_status()
            
            print("\n🎉 ЗАПУСК ЗАВЕРШЕН!")
            print("=" * 50)
            if self.tunnel_url:
                print("Теперь настройте Telegram бота и протестируйте приложение!")
            else:
                print("Для тестирования в реальном Telegram настройте туннель")
            
            # Ждем завершения
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n👋 Завершение работы...")
                self.stop_all()
            
        except Exception as e:
            print(f"❌ Ошибка запуска: {e}")
            self.stop_all()
            return False

def main():
    runner = TelegramLocalRunner()
    runner.run()

if __name__ == "__main__":
    main() 