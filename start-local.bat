@echo off
echo Starting PromptShelf Backend and Frontend...
start "PromptShelf Backend (Port 3001)" cmd /k "cd /d %~dp0promptshelf-backend && npm run dev"
timeout /t 2 /nobreak >nul
start "PromptShelf Frontend (Port 5173)" cmd /k "cd /d %~dp0promptshelf-frontend && npm run dev"
echo PromptShelf is running!
echo Backend:  http://localhost:3001/api/health
echo Frontend: http://localhost:5173
pause
