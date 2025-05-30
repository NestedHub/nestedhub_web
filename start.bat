@echo off
echo Starting backend server...
start cmd /k "cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo Starting frontend server...
timeout /t 2 /nobreak
start cmd /k "cd frontend && npm run dev"
