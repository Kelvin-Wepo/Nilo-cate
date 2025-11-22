#!/bin/bash

# Nilocate Setup Script
# This script helps set up the development environment

echo "🌿 Setting up Nilocate Development Environment..."
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10 or higher."
    exit 1
fi

echo "✅ Python 3 found"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Node.js found"

# Backend Setup
echo ""
echo "📦 Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env and add your API keys!"
fi

echo "Running database migrations..."
python manage.py migrate

echo ""
read -p "Create superuser for Django admin? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python manage.py createsuperuser
fi

deactivate
cd ..

# Frontend Setup
echo ""
echo "📦 Setting up Frontend..."
cd frontend

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit frontend/.env and add your Google Maps API key!"
fi

echo "Installing Node.js dependencies..."
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add API keys to backend/.env and frontend/.env"
echo "   - Get Gemini API key from: https://makersuite.google.com/app/apikey"
echo "   - Get Google Maps API key from: https://console.cloud.google.com/"
echo ""
echo "2. Start the backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python manage.py runserver"
echo ""
echo "3. Start the frontend (in a new terminal):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "4. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - Admin Panel: http://localhost:8000/admin/"
echo "   - API Docs: http://localhost:8000/swagger/"
echo ""
echo "🌳 Happy coding! Let's protect endangered trees together!"
