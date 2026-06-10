@echo off
title Customer Segmentation Project - Launcher
color 0A

echo.
echo  ============================================
echo   Customer Segmentation Analytics Dashboard
echo  ============================================
echo.

:: Check if virtual environment exists
if not exist ".venv\Scripts\python.exe" (
    echo  [ERROR] Virtual environment not found!
    echo  Run setup.bat first to install dependencies.
    pause
    exit /b 1
)

echo  [1/2] Starting Flask backend on http://localhost:5000 ...
start "Backend - Flask API" cmd /k ".venv\Scripts\python.exe backend\app.py"

:: Wait a moment for backend to start
timeout /t 2 /nobreak >nul

echo  [2/2] Starting Vite frontend on http://localhost:5173 ...
start "Frontend - Vite Dev Server" cmd /k "cd frontend && npm run dev"

:: Wait for Vite to be ready
timeout /t 4 /nobreak >nul

echo.
echo  ============================================
echo   Both servers are starting up!
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:5000
echo  ============================================
echo.
echo  Opening app in browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo  Close the "Backend" and "Frontend" terminal
echo  windows to stop the servers.
echo.
pause
