#!/bin/bash

# Start Backend Server for Dark Tech Project
echo "================================================"
echo "Starting Dark Tech Backend Server"
echo "================================================"

cd "$(dirname "$0")/backend"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating it..."
    python3 -m venv venv
    source venv/bin/activate
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Ensure PYTHONUNBUFFERED for real-time logs
export PYTHONUNBUFFERED=1

echo ""
echo "✅ Backend starting on http://0.0.0.0:8000"
echo "✅ API accessible at http://localhost:8000"
echo "✅ API docs at http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================================"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000