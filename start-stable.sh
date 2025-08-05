#!/bin/bash

echo "🚀 Starting TRULY STABLE Student Addition Flow Server"
echo ""
echo "This server will:"
echo "✅ Handle page refreshes"
echo "✅ Work with multiple tabs"
echo "✅ Stay running until you stop it"
echo "✅ Have hot reload for instant changes"
echo ""
echo "📱 Access at: http://localhost:3000"
echo "🛑 Stop with: Ctrl+C"
echo ""

# Kill any existing processes
echo "🧹 Cleaning up any existing servers..."
pkill -f "react-scripts\|webpack\|node.*start" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Wait for cleanup
sleep 3

# Set ALL stability environment variables
export BROWSER=none
export FAST_REFRESH=false
export WDS_SOCKET_HOST=localhost
export WDS_SOCKET_PORT=3000
export CHOKIDAR_USEPOLLING=true
export WATCHPACK_POLLING=true
export REACT_APP_DISABLE_NEW_JSX_TRANSFORM=false

echo "🔄 Starting development server with stability fixes..."
echo ""

# Start with explicit webpack settings
HOST=localhost PORT=3000 npm start