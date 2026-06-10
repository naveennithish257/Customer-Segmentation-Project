@echo off
title Stopping Servers...
echo.
echo  Stopping Flask and Vite servers...
echo.

:: Kill Python processes running app.py
taskkill /F /FI "WINDOWTITLE eq Backend - Flask API" >nul 2>&1

:: Kill Node/Vite processes
taskkill /F /FI "WINDOWTITLE eq Frontend - Vite Dev Server" >nul 2>&1

:: Also kill by port just in case
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000 "') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 "') do taskkill /F /PID %%a >nul 2>&1

echo  Servers stopped.
echo.
timeout /t 2 /nobreak >nul
