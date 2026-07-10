Write-Host "🚀 Starting Everest Admin..." -ForegroundColor Green
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$backendJob = Start-Job -ScriptBlock {
    Set-Location "$using:root\backend"
    node server.js
}

$frontendJob = Start-Job -ScriptBlock {
    Set-Location "$using:root\frontend"
    npx vite
}

Write-Host "✅ Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "✅ Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "✅ Admin Login: admin@everest.com / admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to stop both servers..." -ForegroundColor Magenta
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Stop-Job $backendJob -ErrorAction SilentlyContinue
Stop-Job $frontendJob -ErrorAction SilentlyContinue
Remove-Job $backendJob -ErrorAction SilentlyContinue
Remove-Job $frontendJob -ErrorAction SilentlyContinue
Write-Host "🛑 Servers stopped." -ForegroundColor Red
