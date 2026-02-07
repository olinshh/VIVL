# VIVL — Local Setup Guide

This guide walks you through running the backend + frontend locally.

## Prereqs
- Python 3.11+
- Node.js 18+

## 1) Backend
From the repo root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
```

Create `backend/.env` (example below):
```
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
DATABASE_PATH=./fraudops.db
```

Seed the database:
```powershell
.\.venv\Scripts\python seed.py
```

Start the API:
```powershell
.\.venv\Scripts\python -m uvicorn main:app --reload --port 8000
```

API should be available at:
```
http://localhost:8000
```

## 2) Frontend
In a new terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the app at:
```
http://localhost:3000
```

## Notes
- If you change DB schema, delete `backend/fraudops.db` and re-run `seed.py`.
- Set `NEXT_PUBLIC_API_BASE` if your backend runs on a different host/port:
```
NEXT_PUBLIC_API_BASE=http://localhost:8000
```
