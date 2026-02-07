# VIVL - Real-Time Fraud Intelligence Platform
# Makefile for Windows PowerShell

.PHONY: help install seed backend frontend dev clean reset

help:
	@echo "VIVL Makefile Commands:"
	@echo "  make install   - Install all dependencies (backend + frontend)"
	@echo "  make seed      - Seed database with synthetic transaction data"
	@echo "  make backend   - Start FastAPI backend server (port 8000)"
	@echo "  make frontend  - Start Next.js frontend dev server (port 3000)"
	@echo "  make dev       - Run both backend and frontend concurrently"
	@echo "  make clean     - Stop all running servers"
	@echo "  make reset     - Clear database and reseed fresh data"

install:
	@echo "Installing backend dependencies..."
	@cd backend && python -m venv .venv && .\.venv\Scripts\pip install -r ../requirements.txt
	@echo "Installing frontend dependencies..."
	@cd frontend && npm install
	@echo "✅ Installation complete!"

seed:
	@echo "Seeding database..."
	@cd backend && .\.venv\Scripts\python seed.py
	@echo "✅ Database seeded with 103 transactions (50/50 normal/fraud split)"

backend:
	@echo "Starting FastAPI backend on http://localhost:8000"
	@cd backend && .\.venv\Scripts\python -m uvicorn main:app --reload --port 8000

frontend:
	@echo "Starting Next.js frontend on http://localhost:3000"
	@cd frontend && npm run dev

dev:
	@echo "Starting VIVL in development mode..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo ""
	@echo "Run these commands in separate terminals:"
	@echo "  Terminal 1: make backend"
	@echo "  Terminal 2: make frontend"

clean:
	@echo "Stopping all Python and Node processes..."
	@powershell -Command "Stop-Process -Name python* -Force -ErrorAction SilentlyContinue; Stop-Process -Name node* -Force -ErrorAction SilentlyContinue"
	@echo "✅ All processes stopped"

reset:
	@echo "Resetting database..."
	@cd backend && del /F /Q fraudops.db 2>nul || echo Database already clear
	@cd backend && .\.venv\Scripts\python seed.py
	@echo "✅ Database reset complete!"
