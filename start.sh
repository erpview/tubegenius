#!/bin/bash
set -e

echo "Installing yt-dlp..."
pip install --upgrade yt-dlp

echo "Installing server dependencies..."
cd server
npm install

echo "Starting server..."
node server.js
