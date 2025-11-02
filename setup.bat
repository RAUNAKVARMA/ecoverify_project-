@echo off
REM EcoVerify Setup Script for Windows

echo.
echo ========================================
echo    EcoVerify - Quick Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found: 
node --version

echo.
echo ========================================
echo Setting up Backend...
echo ========================================
echo.

cd backend

echo Installing backend dependencies...
call npm install

echo.
echo Backend setup complete!
echo.

cd ..

echo.
echo ========================================
echo Setting up Frontend...
echo ========================================
echo.

cd frontend

echo Installing frontend dependencies...
call npm install

echo.
echo Frontend setup complete!
echo.

cd ..

echo.
echo ========================================
echo ✓ Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Open a terminal and run:
echo    cd backend
echo    npm start
echo.
echo 2. Open another terminal and run:
echo    cd frontend
echo    npm start
echo.
echo That's it! The app will open in your browser.
echo.
echo Demo Accounts:
echo  - Consumer: priya@example.com / password123
echo  - Brand: arjun@example.com / password123
echo.
pause
