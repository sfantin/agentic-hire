# Script para iniciar AgenticHire no PowerShell
# Uso: .\start-dev.ps1

Write-Host "Iniciando AgenticHire..." -ForegroundColor Green
Write-Host ""

# Terminal 1: Backend
Write-Host "Iniciando Backend na porta 8003..." -ForegroundColor Cyan
$backendPath = "D:\PROJETOS_7DEOUROS\AgenticHire\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; python -m uvicorn app.main:app --reload --port 8003"

# Aguardar 2 segundos para o backend iniciar
Start-Sleep -Seconds 2

# Terminal 2: Frontend
Write-Host "Iniciando Frontend na porta 5173..." -ForegroundColor Cyan
$frontendPath = "D:\PROJETOS_7DEOUROS\AgenticHire\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"

Write-Host ""
Write-Host "Ambos os servicos iniciados!" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend: http://localhost:8003" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para parar: Feche as janelas do PowerShell" -ForegroundColor Gray
