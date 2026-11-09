@echo off
title EduHujjat Telegram Bot Server
color 0A
echo ============================================================
echo       EduHujjat AI Telegram Bot Ishga Tushirilmoqda...
echo ============================================================
echo.
cd /d "C:\Users\hp\OneDrive\Desktop\Antigravity projects\eduhujjat"
node bot-local.js
if %errorlevel% neq 0 (
    echo.
    echo [XATOLIK] Bot to'xtab qoldi. Qayta urinib ko'rilmoqda...
    timeout /t 5
    goto loop
)
:loop
node bot-local.js
timeout /t 5
goto loop
