@echo off
title EduHujjat AI - Unified Local Server & Auto-Watchdog
color 0B
cd /d "%~dp0"
echo ======================================================================
echo       EduHujjat AI - Zaxira Server va Ikki Tomonlama Watchdog
echo       (Render 503 Auto-Failover ^& Render 200 Auto-Failback)
echo ======================================================================
echo.
echo [1/1] Yagona Unified Server (Node Bot + Cloudflare HA Tunnel + Watchdog) ishga tushmoqda...
echo.
python run_unified_server.py
pause
