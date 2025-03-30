#!/bin/bash

# Start Python backend in the background
echo "Starting Python backend..."
python python_backend/app.py &
PYTHON_PID=$!

# Give Python backend a moment to start
sleep 2

# Start Node.js frontend
echo "Starting Node.js frontend..."
npm run dev

# When the frontend is stopped, also stop the Python backend
kill $PYTHON_PID