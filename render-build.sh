#!/bin/bash
set -e

echo "📦 Installing yt-dlp..."
pip install yt-dlp

echo "📦 Installing Node.js dependencies..."
cd server
npm install

echo "✅ Build complete!"
