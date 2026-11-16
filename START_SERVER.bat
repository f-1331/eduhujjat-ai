@echo off
title EduHujjat AI - Unified Local Server & Auto-Watchdog
color 0B
cd /d "%~dp0"
echo ======================================================================
echo       EduHujjat AI - Zaxira Server va Ikki Tomonlama Watchdog
echo       (Render 503 Auto-Failover ^& Render 200 Auto-Failback)
echo ======================================================================
echo.
echo [1/2] Render nazoratchisi (Watchdog) fonda ishga tushirilmoqda...
start "EduHujjat Render Watchdog" /min python render_failback_watchdog.py
echo [2/2] Asosiy Unified Server (Node Bot + Cloudflare Tunnel) ishga tushmoqda...
echo.
python run_unified_server.py
pause
