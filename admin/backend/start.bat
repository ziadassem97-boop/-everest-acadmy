@echo off
set NODE_ENV=development
REM Set these env vars before running, or use a .env file
set TURSO_URL=libsql://everest-academy-ziad-assem1.aws-eu-west-1.turso.io
REM set TURSO_TOKEN=your_turso_token_here
REM set GEMINI_API_KEY=your_gemini_key_here
set CORS_ORIGIN=http://localhost:4000,http://localhost:3000

echo Killing any process on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do (
  echo Killing PID %%a
  taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo Starting backend...
node server.js
pause
