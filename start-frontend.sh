#!/bin/bash

# Start Frontend Development Server for Dark Tech Project
echo "================================================"
echo "Starting Dark Tech Frontend Dev Server"
echo "================================================"

cd "$(dirname "$0")/frontend"

# Use fnm to ensure correct Node version
eval "$(fnm env)"
fnm use 22

echo ""
echo "✅ Frontend starting on http://localhost:5173"
echo "✅ Using Node $(node --version)"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================================"
echo ""

npm run dev
