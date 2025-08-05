#!/bin/bash

echo "Starting Student Addition Flow (Production Mode)"
echo "This will be stable and work with multiple tabs/refreshes"
echo ""
echo "Access it at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

# Kill any existing serve processes
pkill -f "serve.*build" 2>/dev/null || true

# Serve the production build with SPA support
serve -s build -l 3000 --single