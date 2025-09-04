@echo off
echo ===============================================
echo    AI Gym Coach - Deployment Script
echo ===============================================
echo.

echo [1] Building Frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)
echo [SUCCESS] Build completed!
echo.

echo [2] Deploying to Vercel...
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    call npm i -g vercel
)

echo Deploying to production...
call vercel --prod --yes

if %errorlevel% equ 0 (
    echo.
    echo ===============================================
    echo    DEPLOYMENT SUCCESSFUL!
    echo ===============================================
    echo.
    echo Next steps:
    echo 1. Copy the Vercel URL from above
    echo 2. Open Telegram and go to @BotFather
    echo 3. Select your bot: /mybots
    echo 4. Go to Bot Settings - Menu Button
    echo 5. Paste your Vercel URL
    echo.
    echo Your bot token: 8229627175:AAHcE5hizxJTOol5bMXzm9NE6fM74v4syYI
    echo.
) else (
    echo.
    echo [ERROR] Deployment failed!
    echo Please check your Vercel configuration.
)

cd ..
pause