#!/bin/bash

# Start the React development server in a stable way
echo "Starting Student Addition Flow server..."
echo "Access it at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

# Set environment variables
export BROWSER=none  # Prevents auto-opening browser tabs
export CI=false      # Prevents treating warnings as errors

# Start the server
npm start