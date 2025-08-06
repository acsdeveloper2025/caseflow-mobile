#!/bin/bash

# CaseFlow Mobile - iOS Simulator Runner
# This script launches the app in iOS Simulator for testing

echo "🚀 Starting CaseFlow Mobile in iOS Simulator..."

# Check if development server is running
if ! curl -s http://localhost:5173 > /dev/null; then
    echo "📱 Starting development server..."
    npm run dev -- --host &
    DEV_SERVER_PID=$!
    
    # Wait for server to start
    echo "⏳ Waiting for development server to start..."
    while ! curl -s http://localhost:5173 > /dev/null; do
        sleep 1
    done
    echo "✅ Development server is running!"
else
    echo "✅ Development server is already running!"
fi

# Boot iPhone simulator
echo "📱 Booting iPhone 16 Pro simulator..."
xcrun simctl boot "iPhone 16 Pro" 2>/dev/null || echo "📱 Simulator already booted"

# Open Simulator app
echo "📱 Opening iOS Simulator..."
open -a Simulator

# Wait a moment for simulator to fully load
sleep 3

# Open the app in Safari
echo "🌐 Opening CaseFlow Mobile in Safari..."
xcrun simctl openurl booted "http://localhost:5173"

echo ""
echo "🎉 CaseFlow Mobile is now running in iOS Simulator!"
echo ""
echo "📱 Device: iPhone 16 Pro"
echo "🌐 URL: http://localhost:5173"
echo "🌍 Network URL: http://192.168.1.25:5173 (for real devices)"
echo ""
echo "💡 Tips:"
echo "   • Use Safari in the simulator for the best experience"
echo "   • The app is responsive and optimized for mobile"
echo "   • You can test touch interactions and gestures"
echo "   • Use Cmd+R to refresh the app in Safari"
echo ""
echo "🛑 To stop: Press Ctrl+C to stop the development server"

# Keep script running if we started the dev server
if [ ! -z "$DEV_SERVER_PID" ]; then
    echo "⏳ Development server running (PID: $DEV_SERVER_PID)"
    echo "   Press Ctrl+C to stop..."
    wait $DEV_SERVER_PID
fi
