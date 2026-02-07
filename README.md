# VIVL — Real-Time Fraud Intelligence Platform

**AI-powered transaction monitoring with explainable risk scoring and automated case generation.**

VIVL integrates into payment processing flows as a decision-support layer that scores fraud risk in real-time, produces transparent APPROVE/REVIEW/BLOCK decisions, and automatically generates investigation case files when needed.

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** (with pip and venv)
- **Node.js 18+** (with npm)
- **Windows PowerShell** (or any terminal)

### Installation

1. **Clone the repository:**
   ```powershell
   git clone <repository-url>
   cd VIVL
   ```

2. **Install dependencies:**
   ```powershell
   .\run.ps1 install
   ```
   Or manually:
   ```powershell
   # Backend
   cd backend
   python -m venv .venv
   .\.venv\Scripts\pip install -r ../requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Seed the database:**
   ```powershell
   .\run.ps1 seed
   ```
   This creates 103 synthetic transactions with a 50/50 split between normal and fraudulent patterns.

### Running the Application

**Option 1: Using PowerShell Script** (recommended)

Open **two separate terminals**:

**Terminal 1 - Backend:**
```powershell
.\run.ps1 backend
```
Backend will run at `http://localhost:8000`

**Terminal 2 - Frontend:**
```powershell
.\run.ps1 frontend
```
Frontend will run at `http://localhost:3000`

**Option 2: Manual Start**

**Terminal 1 - Backend:**
```powershell
cd backend
.\.venv\Scripts\python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### Access the Application

Once both servers are running:
- **Frontend UI:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## 📋 PowerShell Commands

```powershell
.\run.ps1 help      # Show all available commands
.\run.ps1 install   # Install all dependencies
.\run.ps1 seed      # Seed database with synthetic data
.\run.ps1 backend   # Start FastAPI backend (port 8000)
.\run.ps1 frontend  # Start Next.js frontend (port 3000)
.\run.ps1 clean     # Stop all running servers
.\run.ps1 reset     # Clear database and reseed
```

> **Note:** If you have GNU Make installed, you can use `make` commands instead (e.g., `make backend`).

---

## 🎯 Features

### Real-Time Fraud Detection
- **6 Fraud Signals:** Velocity attacks, amount anomalies, device changes, geo shifts, young account patterns, PSP anomalies
- **Weighted Scoring:** Each signal contributes 10-25 points to final risk score (0-100)
- **Decision Thresholds:** 
  - `< 40` → **APPROVE** ✅
  - `40-79` → **REVIEW** ⚠️ (creates investigation case)
  - `≥ 80` → **BLOCK** 🚫 (creates investigation case)

### Explainable Decisions
Every risk score includes:
- List of fired fraud signals
- Reasoning for each signal
- Full audit trail with timestamps
- Historical transaction context

### Automated Case Generation
- **Review/Block transactions** automatically create investigation cases
- Cases include evidence, confidence levels, and decision recommendations
- Full case management interface in `/cases` page

### Live Demo Mode
- Auto-seeding feature on homepage
- Real-time transaction processing simulation
- Live statistics dashboard
- Recent transactions feed with color-coded decisions

---

## 🏗️ Architecture

### Backend (`/backend`)
- **Framework:** FastAPI (Python 3.11+)
- **Database:** SQLite (`fraudops.db`)
- **Components:**
  - `main.py` - API endpoints and routing
  - `risk_engine.py` - Fraud detection logic
  - `decision_service.py` - Decision orchestration
  - `llm_client.py` - AI adjudication (enabled with graceful fallback)
  - `seed.py` - Synthetic data generation
  - `models.py` - Database schema (Pydantic models)

### Frontend (`/frontend`)
- **Framework:** Next.js 14 (React App Router)
- **Pages:**
  - `/` - Home (auto-seeding demo dashboard)
  - `/cases` - Pending investigation cases
  - `/data` - Full case history with sorting
- **Styling:** Modern dark theme with blue security accents

### Database Schema
- `transactions` - All payment transactions
- `risk_decisions` - Risk scores and decisions
- `cases` - Investigation case files
- `audit_log` - Append-only audit trail

---

## 🧪 Testing the System

### 1. Auto-Seeding Demo (Easiest)
1. Open http://localhost:3000
2. Click **"Start Analysis"** button
3. Watch live fraud detection in action
4. Observe stats update in real-time

### 2. Manual API Testing
```powershell
# Get next unscored transaction
Invoke-RestMethod -Uri "http://localhost:8000/transactions/next" -Method Get

# Process a transaction
$tx = Invoke-RestMethod -Uri "http://localhost:8000/transactions/next" -Method Get
Invoke-RestMethod -Uri "http://localhost:8000/transactions/ingest" -Method Post -Body ($tx | ConvertTo-Json) -ContentType "application/json"

# Check cases
Invoke-RestMethod -Uri "http://localhost:8000/cases" -Method Get
```

### 3. Database Reset
If you want to start fresh:
```powershell
.\run.ps1 reset
```
Or manually:
```powershell
cd backend
del fraudops.db
.\.venv\Scripts\python seed.py
```

---

## 🔬 Fraud Patterns in Seed Data

The system generates 103 synthetic transactions:

### Normal Patterns (~50 transactions)
- 25 users with 2-3 transactions each
- Mix of deposits ($100-400) and withdrawals
- Realistic timestamps, countries, devices

### Fraudulent Patterns (~50 transactions)

**Velocity Attacks (5 users = 20 tx):**
- 1 deposit followed by 3 rapid withdrawals (5min intervals)
- Device change + geo shift between transactions
- **Expected Score:** ~60 (triggers REVIEW)

**Young Account + Large Amount (10 users = 20 tx):**
- Account age < 7 days
- Large withdrawal ($1200-5000) on 2nd transaction
- **Expected Score:** ~60 (triggers REVIEW)

**Detection Results:**
- Normal transactions should **APPROVE** (score < 40)
- Fraud patterns should trigger **REVIEW** (score 40-79)
- System correctly identifies suspicious behavior

---

## 🛠️ Configuration

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and add your API key:
```env
# Gemini API key for AI adjudication (optional)
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

⚠️ **Important:** After changing the API key, restart the backend server to load the new value.

### Risk Thresholds

Edit `backend/risk_engine.py`:
```python
REVIEW_MIN = 40      # Minimum score for review
BLOCK_THRESHOLD = 80 # Minimum score for block
```

### Signal Weights

Edit `backend/risk_engine.py`:
```python
# Adjust fraud signal weights (total recommended: 100-150)
'velocity_withdrawals_20m': 25,
'amount_vs_user_avg': 20,
'new_device': 15,
'geo_change': 20,
'young_account_high_amount': 25,
'psp_anomaly': 10,
```

---

## 📊 API Reference

### Core Endpoints

**GET `/transactions/next`**
- Returns next unscored transaction in chronological order

**POST `/transactions/ingest`**
- Process transaction through fraud detection pipeline
- Returns risk score, decision, and reasoning

**GET `/cases`**
- Returns all investigation cases (filterable by status)

**GET `/audit`**
- Returns full audit trail with filters

**POST `/transactions/seed`**
- Clears database and reseeds with synthetic data

Full API documentation: http://localhost:8000/docs

---

## 🎨 UI Features

### Modern Professional Design
- Dark slate theme with security focus
- Blue gradient accent colors for trust
- High-contrast color scheme for readability
- Glassmorphism effects with backdrop blur

### Decision Color Coding
- **Green** (#22c55e) - Approved transactions ✅
- **Yellow** (#eab308) - Under review ⚠️
- **Red** (#ef4444) - Blocked transactions 🚫

### Interactive Elements
- Real-time stats dashboard
- Live transaction feed (last 10 results)
- Sortable data tables
- Case management interface

---

## 🚧 Known Limitations

- **LLM Integration:** Enabled with graceful fallback when quota exceeded (free tier: 20 requests/day). ⚠️ Restart backend after changing `GEMINI_API_KEY` in .env
- **Database:** SQLite is suitable for demo/development only (use PostgreSQL for production)
- **Authentication:** Not implemented (add authentication layer for production use)
- **Rate Limiting:** Not implemented on API endpoints
- **Concurrent Processing:** Single-threaded processing (consider queue system for scale)

---

## 📝 Development Notes

### Adding New Fraud Signals

1. Add detection logic in `risk_engine.py`:
```python
def compute_signals(tx, user_history):
    signals = {}
    
    # Your new signal
    if <condition>:
        signals['new_signal_name'] = {
            'weight': 15,
            'reason': 'Description of why this fired'
        }
    
    return signals
```

2. Test with synthetic data in `seed.py`

### Modifying Seed Data

Edit `backend/seed.py` functions:
- `seed_normal_users()` - Normal transaction patterns
- `seed_fraudulent_transactions()` - Fraud scenarios

---

## 🤝 Support

For questions or issues, check:
- API documentation at http://localhost:8000/docs
- Backend logs in terminal running uvicorn
- Frontend console in browser DevTools

---

## 📜 License

MIT License - feel free to use for hackathons, demos, or production with modifications!

---

**Built for hackathons. Designed for fraud prevention. Powered by explainable AI.** 🛡️
