#!/bin/bash

# Build and run iOS app for Dark Tech Project
echo "================================================"
echo "Building and Running Dark Tech iOS App"
echo "================================================"

cd "$(dirname "$0")/frontend"

# Use fnm to ensure correct Node version
eval "$(fnm env)"
fnm use 22

echo ""
echo "📱 Node version: $(node --version)"
echo "📦 Building Vue app..."

npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "🔄 Syncing to iOS..."
npx cap sync ios

if [ $? -ne 0 ]; then
    echo "❌ Sync failed!"
    exit 1
fi

echo ""
echo "✅ Build complete! Opening Xcode..."
echo "================================================"
echo ""
echo "In Xcode:"
echo "  1. Select an iPhone simulator (e.g., iPhone 15 Pro)"
echo "  2. Click the Play button (▶️) or press Cmd+R"
echo ""

npx cap open ios
