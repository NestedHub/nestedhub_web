#!/bin/bash

# Start backend server
cd backend
echo "Starting backend server..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &

# Wait a bit for backend to start
sleep 2

echo "Starting frontend server..."
cd ../frontend
npm run dev
