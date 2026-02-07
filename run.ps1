# VIVL - PowerShell Helper Script for Windows
# Alternative to Makefile for systems without GNU Make

param(
    [Parameter(Position=0)]
    [string]$Command
)

function Show-Help {
    Write-Host "VIVL PowerShell Commands:" -ForegroundColor Cyan
    Write-Host "  .\run.ps1 install   - Install all dependencies (backend + frontend)" -ForegroundColor Gray
    Write-Host "  .\run.ps1 seed      - Seed database with synthetic transaction data" -ForegroundColor Gray
    Write-Host "  .\run.ps1 backend   - Start FastAPI backend server (port 8000)" -ForegroundColor Gray
    Write-Host "  .\run.ps1 frontend  - Start Next.js frontend dev server (port 3000)" -ForegroundColor Gray
    Write-Host "  .\run.ps1 clean     - Stop all running servers" -ForegroundColor Gray
    Write-Host "  .\run.ps1 reset     - Clear database and reseed fresh data" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Example: " -NoNewline -ForegroundColor Yellow
    Write-Host ".\run.ps1 backend" -ForegroundColor White
}

function Install-Dependencies {
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    Set-Location backend
    python -m venv .venv
    .\.venv\Scripts\pip install -r ..\requirements.txt
    Set-Location ..
    
    Write-Host "`nInstalling frontend dependencies..." -ForegroundColor Cyan
    Set-Location frontend
    npm install
    Set-Location ..
    
    Write-Host "`n✅ Installation complete!" -ForegroundColor Green
}

function Seed-Database {
    Write-Host "Seeding database..." -ForegroundColor Cyan
    Set-Location backend
    .\.venv\Scripts\python seed.py
    Set-Location ..
    Write-Host "✅ Database seeded with 103 transactions (50/50 normal/fraud split)" -ForegroundColor Green
}

function Start-Backend {
    Write-Host "Starting FastAPI backend on http://localhost:8000" -ForegroundColor Cyan
    Set-Location backend
    .\.venv\Scripts\python -m uvicorn main:app --reload --port 8000
}

function Start-Frontend {
    Write-Host "Starting Next.js frontend on http://localhost:3000" -ForegroundColor Cyan
    Set-Location frontend
    npm run dev
}

function Clean-Processes {
    Write-Host "Stopping all Python and Node processes..." -ForegroundColor Cyan
    Stop-Process -Name python* -Force -ErrorAction SilentlyContinue
    Stop-Process -Name node* -Force -ErrorAction SilentlyContinue
    Write-Host "✅ All processes stopped" -ForegroundColor Green
}

function Reset-Database {
    Write-Host "Resetting database..." -ForegroundColor Cyan
    Set-Location backend
    Remove-Item fraudops.db -Force -ErrorAction SilentlyContinue
    .\.venv\Scripts\python seed.py
    Set-Location ..
    Write-Host "✅ Database reset complete!" -ForegroundColor Green
}

# Main switch
switch ($Command.ToLower()) {
    "install" { Install-Dependencies }
    "seed" { Seed-Database }
    "backend" { Start-Backend }
    "frontend" { Start-Frontend }
    "clean" { Clean-Processes }
    "reset" { Reset-Database }
    "help" { Show-Help }
    default {
        if ($Command) {
            Write-Host "Unknown command: $Command" -ForegroundColor Red
            Write-Host ""
        }
        Show-Help
    }
}
