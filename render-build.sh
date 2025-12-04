#!/bin/bash
set -e

echo "🔧 Installing system dependencies..."
apt-get update
apt-get install -y python3 python3-pip ffmpeg

echo "📦 Installing yt-dlp..."
pip3 install --break-system-packages yt-dlp

echo "📦 Installing Node.js dependencies..."
cd server
npm install

echo "✅ Build complete!"
