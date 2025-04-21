#!/bin/bash

# Function to kill process on a port
kill_port() {
    local port=$1
    echo "Checking for processes on port $port..."
    if lsof -ti:$port > /dev/null; then
        echo "Killing process on port $port..."
        lsof -ti:$port | xargs kill -9
        sleep 2
    fi
}

# Kill processes on required ports
kill_port 3000  # Frontend port
kill_port 8000  # Backend port

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required commands
if ! command_exists python3; then
    echo "Python 3 is required but not installed"
    exit 1
fi

if ! command_exists npm; then
    echo "npm is required but not installed"
    exit 1
fi

# Get the absolute path of the project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Setup and run backend
echo "Setting up backend..."
cd "$PROJECT_ROOT/backend"

# Create and activate virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing backend dependencies..."
pip install -r requirements.txt

# Run migrations and seed database
echo "Setting up database..."
alembic upgrade head
PYTHONPATH=$PROJECT_ROOT/backend python -m app.scripts.seed_db

# Start backend server in background
echo "Starting backend server..."
cd "$PROJECT_ROOT/backend"
PYTHONPATH=$PROJECT_ROOT/backend uvicorn app.main:app --reload &
BACKEND_PID=$!

# Setup and run frontend
echo "Setting up frontend..."
cd "$PROJECT_ROOT/frontend"

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Start frontend server in background
echo "Starting frontend server..."
npm start &
FRONTEND_PID=$!

# Function to handle cleanup
cleanup() {
    echo "Cleaning up..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up trap for cleanup on script exit
trap cleanup SIGINT SIGTERM

echo "Application is running!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the application"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID 