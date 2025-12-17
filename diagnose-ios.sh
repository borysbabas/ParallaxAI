#!/bin/bash

# iOS Development Diagnostic Script
echo "🔍 Dark Tech iOS Development Diagnostics"
echo "========================================"
echo ""

# Check Node version
echo "📱 Node version:"
node --version
echo ""

# Check backend status
echo "🖥️  Backend status:"
if lsof -i :8000 > /dev/null 2>&1; then
    echo "✅ Backend is running on port 8000"
else
    echo "❌ Backend is NOT running on port 8000"
    echo "   Start it with: ./start-backend.sh"
fi
echo ""

# Get Mac IP address
echo "🌐 Mac IP addresses:"
IP_EN0=$(ipconfig getifaddr en0 2>/dev/null)
IP_EN1=$(ipconfig getifaddr en1 2>/dev/null)

if [ -n "$IP_EN0" ]; then
    echo "   en0 (WiFi): $IP_EN0"
fi

if [ -n "$IP_EN1" ]; then
    echo "   en1 (Ethernet): $IP_EN1"
fi

if [ -z "$IP_EN0" ] && [ -z "$IP_EN1" ]; then
    echo "   ❌ No network connection detected"
fi
echo ""

# Check .env.local configuration
echo "⚙️  Frontend configuration:"
if [ -f "frontend/.env.local" ]; then
    echo "✅ .env.local exists"
    VITE_API_URL=$(grep VITE_API_URL frontend/.env.local | cut -d '=' -f2)
    echo "   VITE_API_URL=$VITE_API_URL"

    # Test if the configured URL is accessible
    if [ -n "$VITE_API_URL" ]; then
        echo ""
        echo "🔌 Testing API connectivity:"
        if curl -s -m 5 "$VITE_API_URL/docs" > /dev/null 2>&1; then
            echo "✅ API is accessible at $VITE_API_URL"
        else
            echo "❌ API is NOT accessible at $VITE_API_URL"
            echo "   Check if:"
            echo "   - Backend is running"
            echo "   - IP address is correct"
            echo "   - Firewall allows connections"
        fi
    fi
else
    echo "⚠️  .env.local does NOT exist"
    echo "   Create it with: cp frontend/.env.local.example frontend/.env.local"
    echo "   Then edit it with your Mac's IP address"
fi
echo ""

# Check if build is up to date
echo "📦 Build status:"
if [ -d "frontend/dist" ]; then
    echo "✅ Build directory exists"
    BUILD_TIME=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" frontend/dist 2>/dev/null)
    echo "   Last build: $BUILD_TIME"
else
    echo "⚠️  No build directory found"
    echo "   Run: cd frontend && npm run build"
fi
echo ""

echo "========================================"
echo "💡 Quick commands:"
echo "   Start backend:  ./start-backend.sh"
echo "   Build frontend: cd frontend && npm run build"
echo "   Sync iOS:       cd frontend && npx cap sync ios"
echo "   Open Xcode:     cd frontend && npx cap open ios"
echo ""
echo "📖 For more info, see: docs/mobile/ios-local-development.md"
