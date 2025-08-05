#!/bin/bash

echo "🚀 Starting RELIABLE Student Addition Flow Server"
echo ""

# Kill any existing processes
pkill -f "serve.*build" 2>/dev/null || true
pkill -f "python.*http.server" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true

# Find an available port
PORT=3000
for p in 3000 3001 3002 8080 8081; do
    if ! lsof -Pi :$p -sTCP:LISTEN -t >/dev/null ; then
        PORT=$p
        break
    fi
done

echo "📱 Starting server on port $PORT"
echo "🌐 Access at: http://localhost:$PORT"
echo ""

# Start simple HTTP server
cd build && python3 -m http.server $PORT