#!/bin/bash

# Git pull
git pull

# Build client
cd client
npm run build
cd ..

# Start server in background
node server.js &
SERVER_PID=$!

# Start ngrok
ngrok http 3000

# Cleanup on exit
trap "kill $SERVER_PID" EXIT