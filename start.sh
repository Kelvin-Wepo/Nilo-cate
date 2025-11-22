#!/bin/bash

# Quick Start Script for Nilocate
# Starts both backend and frontend servers

echo "🌿 Starting Nilocate..."

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Start Backend
echo "🚀 Starting Django backend..."
cd backend
source venv/bin/activate
python manage.py runserver > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start Frontend
echo "🚀 Starting React frontend..."
cd frontend
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Nilocate is running!"
echo ""
echo "📍 Access points:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   Admin:     http://localhost:8000/admin/"
echo "   API Docs:  http://localhost:8000/swagger/"
echo ""
echo "📋 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for processes
wait
