# 🚀 Развертывание AI Gym Coach

## Обзор развертывания

AI Gym Coach поддерживает различные способы развертывания для разных сценариев использования.

## Варианты развертывания

### 1. Локальная разработка
### 2. Docker Compose (рекомендуется)
### 3. Облачные платформы
### 4. VPS/Сервер

## 1. Локальная разработка

### Предварительные требования

- Node.js 18+
- Python 3.11+
- PostgreSQL (опционально, можно использовать SQLite)

### Установка зависимостей

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
pip install -r requirements.txt
```

### Настройка переменных окружения

```bash
# Скопируйте пример конфигурации
cp env.example .env

# Отредактируйте .env файл
nano .env
```

### Запуск приложения

```bash
# Терминал 1: Frontend
cd frontend
npm run dev

# Терминал 2: Backend
cd backend
python main.py
```

### Проверка

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 2. Docker Compose (рекомендуется)

### Предварительные требования

- Docker 20.10+
- Docker Compose 2.0+

### Быстрый старт

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd fitness-bot

# Настройте переменные окружения
cp env.example .env
# Отредактируйте .env файл

# Запустите приложение
docker-compose up --build
```

### Конфигурация Docker

#### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/aigym_coach
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=aigym_coach
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

#### Frontend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Backend Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Команды Docker

```bash
# Запуск
docker-compose up --build

# Запуск в фоне
docker-compose up -d

# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f

# Пересборка
docker-compose build --no-cache
```

## 3. Облачные платформы

### Vercel (Frontend)

#### Установка Vercel CLI

```bash
npm install -g vercel
```

#### Развертывание

```bash
cd frontend
vercel
```

#### Конфигурация

Создайте `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "https://your-backend-url.com"
  }
}
```

### Railway (Backend)

#### Установка Railway CLI

```bash
npm install -g @railway/cli
```

#### Развертывание

```bash
cd backend
railway login
railway init
railway up
```

#### Переменные окружения

```bash
railway variables set DATABASE_URL=postgresql://...
railway variables set TELEGRAM_BOT_TOKEN=your-token
```

### Heroku

#### Установка Heroku CLI

```bash
# macOS
brew install heroku/brew/heroku

# Windows
# Скачайте с https://devcenter.heroku.com/articles/heroku-cli
```

#### Развертывание

```bash
# Frontend
cd frontend
heroku create your-app-frontend
git push heroku main

# Backend
cd backend
heroku create your-app-backend
heroku addons:create heroku-postgresql:mini
git push heroku main
```

#### Конфигурация

```bash
# Backend переменные
heroku config:set TELEGRAM_BOT_TOKEN=your-token
heroku config:set DATABASE_URL=$(heroku config:get DATABASE_URL)

# Frontend переменные
heroku config:set VITE_API_URL=https://your-backend-url.herokuapp.com
```

## 4. VPS/Сервер

### Ubuntu/Debian

#### Установка зависимостей

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка Python
sudo apt install python3 python3-pip python3-venv

# Установка PostgreSQL
sudo apt install postgresql postgresql-contrib

# Установка Nginx
sudo apt install nginx

# Установка Docker (опционально)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

#### Настройка PostgreSQL

```bash
# Создание пользователя и базы данных
sudo -u postgres psql

CREATE USER aigym_user WITH PASSWORD 'your_password';
CREATE DATABASE aigym_coach OWNER aigym_user;
GRANT ALL PRIVILEGES ON DATABASE aigym_coach TO aigym_user;
\q
```

#### Настройка Nginx

```nginx
# /etc/nginx/sites-available/aigym-coach
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/aigym-coach /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Настройка SSL (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx

# Получение SSL сертификата
sudo certbot --nginx -d your-domain.com

# Автоматическое обновление
sudo crontab -e
# Добавьте строку:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Systemd сервисы

```bash
# Backend сервис
sudo nano /etc/systemd/system/aigym-backend.service
```

```ini
[Unit]
Description=AI Gym Coach Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/fitness-bot/backend
Environment=PATH=/home/ubuntu/fitness-bot/backend/venv/bin
ExecStart=/home/ubuntu/fitness-bot/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Активация сервиса
sudo systemctl enable aigym-backend
sudo systemctl start aigym-backend
```

## Переменные окружения

### Обязательные

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/aigym_coach

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token

# Server
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=false
```

### Опциональные

```env
# Frontend
VITE_API_URL=http://localhost:8000
VITE_TELEGRAM_BOT_TOKEN=your-bot-token

# Backend
DATABASE_TEST_URL=sqlite:///./test.db
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000,https://your-domain.com

# Monitoring
PROMETHEUS_ENABLED=true
```

## Мониторинг и логирование

### Prometheus Metrics

```bash
# Проверка метрик
curl http://localhost:8000/metrics
```

### Логирование

```bash
# Backend логи
docker-compose logs -f backend

# Frontend логи
docker-compose logs -f frontend

# Systemd логи
sudo journalctl -u aigym-backend -f
```

### Health Checks

```bash
# Проверка состояния
curl http://localhost:8000/health

# Проверка базы данных
curl http://localhost:8000/health/db
```

## Резервное копирование

### База данных

```bash
# Создание бэкапа
pg_dump -h localhost -U aigym_user aigym_coach > backup.sql

# Восстановление
psql -h localhost -U aigym_user aigym_coach < backup.sql
```

### Автоматическое резервное копирование

```bash
# Создание скрипта
nano /home/ubuntu/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
DB_NAME="aigym_coach"
DB_USER="aigym_user"

mkdir -p $BACKUP_DIR
pg_dump -h localhost -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

```bash
# Добавление в cron
chmod +x /home/ubuntu/backup.sh
crontab -e
# Добавьте строку:
# 0 2 * * * /home/ubuntu/backup.sh
```

## Обновление приложения

### Docker Compose

```bash
# Остановка
docker-compose down

# Получение обновлений
git pull origin main

# Пересборка и запуск
docker-compose up --build -d
```

### Ручное обновление

```bash
# Остановка сервисов
sudo systemctl stop aigym-backend

# Получение обновлений
cd /home/ubuntu/fitness-bot
git pull origin main

# Обновление зависимостей
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Запуск сервисов
sudo systemctl start aigym-backend
```

## Troubleshooting

### Частые проблемы

#### 1. Порт занят

```bash
# Поиск процесса
sudo netstat -tulpn | grep :8000

# Остановка процесса
sudo kill -9 <PID>
```

#### 2. Проблемы с базой данных

```bash
# Проверка подключения
psql -h localhost -U aigym_user -d aigym_coach

# Проверка логов
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### 3. Проблемы с Nginx

```bash
# Проверка конфигурации
sudo nginx -t

# Перезапуск
sudo systemctl restart nginx

# Просмотр логов
sudo tail -f /var/log/nginx/error.log
```

### Логи и отладка

```bash
# Включение debug режима
export DEBUG=true

# Подробные логи
export LOG_LEVEL=DEBUG

# Проверка переменных окружения
env | grep -E "(DATABASE|TELEGRAM|API)"
```

## Безопасность

### Рекомендации

1. **Используйте HTTPS** в продакшене
2. **Регулярно обновляйте** зависимости
3. **Используйте сильные пароли** для базы данных
4. **Ограничьте доступ** к серверу
5. **Настройте firewall**

### Firewall (UFW)

```bash
# Установка
sudo apt install ufw

# Настройка
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Заключение

Выберите подходящий способ развертывания в зависимости от ваших потребностей:

- **Локальная разработка** - для разработки и тестирования
- **Docker Compose** - для быстрого развертывания
- **Облачные платформы** - для простого масштабирования
- **VPS/Сервер** - для полного контроля

Всегда тестируйте развертывание в staging среде перед продакшеном! 