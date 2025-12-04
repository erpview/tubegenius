#!/bin/bash
set -e

echo "📦 Installing latest yt-dlp..."
pip install --upgrade yt-dlp

echo "📦 Installing Node.js dependencies..."
cd server
npm install

echo "✅ Build complete!"
