Write-Host "Starting PromptShelf Backend and Frontend..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\promptshelf-backend'; npm run dev"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\promptshelf-frontend'; npm run dev"

Write-Host "PromptShelf servers are running!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend:  http://localhost:3001/api/health" -ForegroundColor Yellow
