# VIVL - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1️⃣ Install Dependencies
```powershell
.\run.ps1 install
```

### 2️⃣ Seed Database
```powershell
.\run.ps1 seed
```

### 3️⃣ Run Application

**Open TWO terminals:**

**Terminal 1 - Backend:**
```powershell
.\run.ps1 backend
```
✅ Backend running at http://localhost:8000

**Terminal 2 - Frontend:**
```powershell
.\run.ps1 frontend
```
✅ Frontend running at http://localhost:3000

---

## 🎮 Try the Demo

1. Open http://localhost:3000 in your browser
2. Click the **"Start Analysis"** button
3. Watch real-time fraud detection in action!

---

## 🛠️ Useful Commands

```powershell
.\run.ps1 help      # Show all commands
.\run.ps1 reset     # Clear and reseed database
.\run.ps1 clean     # Stop all servers
```

---

## 📖 Full Documentation

See [README.md](README.md) for complete documentation.

---

**Need Help?**
- Backend API Docs: http://localhost:8000/docs
- Check terminal output for error messages
- Ensure both servers are running before accessing frontend
