@echo off
echo ===============================================
echo    AI Gym Coach - Local Testing
echo ===============================================
echo.

echo Starting Backend and Frontend...
echo.

REM Start Backend in new window
start "Backend" cmd /k "cd backend && echo Starting Backend... && python main.py"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend in new window
start "Frontend" cmd /k "cd frontend && echo Starting Frontend... && npm run dev"

echo.
echo ===============================================
echo    Services Started!
echo ===============================================
echo.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo To test in Telegram:
echo 1. Install ngrok: https://ngrok.com
echo 2. Run: ngrok http 5173
echo 3. Use the HTTPS URL in BotFather
echo.
echo Press any key to stop all services...
pause >nul

REM Kill processes
taskkill /F /FI "WindowTitle eq Backend*" >nul 2>&1
taskkill /F /FI "WindowTitle eq Frontend*" >nul 2>&1

echo.
echo Services stopped.
pause