@echo off
title Customer Segmentation Project - Setup
color 0B

echo.
echo  ============================================
echo   Customer Segmentation - First-Time Setup
echo  ============================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python not found. Please install Python 3.10+ from python.org
    pause
    exit /b 1
)

:: Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js not found. Please install Node.js from nodejs.org
    pause
    exit /b 1
)

echo  [1/4] Creating Python virtual environment...
if not exist ".venv" (
    python -m venv .venv
    echo  Done.
) else (
    echo  Already exists, skipping.
)

echo.
echo  [2/4] Installing Python backend dependencies...
.venv\Scripts\pip.exe install -r backend\requirements.txt
if errorlevel 1 (
    echo  [ERROR] Failed to install Python dependencies.
    pause
    exit /b 1
)

echo.
echo  [3/4] Installing Node.js frontend dependencies...
cd frontend
npm install
if errorlevel 1 (
    echo  [ERROR] Failed to install Node dependencies.
    pause
    exit /b 1
)
cd ..

echo.
echo  [4/4] Generating sample data...
.venv\Scripts\python.exe backend\generate_sample_data.py

echo.
echo  ============================================
echo   Setup complete! Run start.bat to launch.
echo  ============================================
echo.
pause
