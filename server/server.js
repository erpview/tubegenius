const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? '*' : ["http://localhost:5173", "http://localhost:3000", "http://192.168.100.136:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Ensure downloads directory exists
const downloadsDir = path.resolve(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Helper to emit status matching frontend 'BackendProcessStatus' interface
const emitStatus = (socket, stage, progress, message) => {
  socket.emit('process-update', {
    stage,    // 'CONNECTING' | 'EXTRACTING' | 'TRANSCODING' | etc.
    progress, // Number 0-100
    message   // String
  });
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('start-download', async ({ url, options }) => {
    const { format, quality } = options;
    const jobId = Date.now();
    const extension = format.toLowerCase() === 'mp3' ? 'mp3' : 'mp4';
    const outputPath = path.resolve(__dirname, 'downloads', `${jobId}.${extension}`);

    try {
      // STAGE 1: CONNECTING
      emitStatus(socket, 'CONNECTING', 10, 'Connecting to YouTube...');
      
      // Validate YouTube URL
      if (!url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)) {
        throw new Error('Invalid YouTube URL');
      }

      // STAGE 2: EXTRACTING
      emitStatus(socket, 'EXTRACTING', 20, 'Extracting video information...');

      // Build yt-dlp command with options to bypass YouTube blocks
      const ytdlpArgs = [
        url,
        '-o', outputPath,
        '--no-playlist',
        '--progress',
        '--newline',
        '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        '--referer', 'https://www.youtube.com/',
        '--no-check-certificate',
        '--extractor-args', 'youtube:player_client=android,web',
        '--extractor-args', 'youtube:skip=dash',
        '--throttled-rate', '100K'
      ];

      // Add format-specific options
      if (format.toLowerCase() === 'mp3') {
        ytdlpArgs.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
      } else {
        // For MP4 video
        if (quality === '1080p') {
          ytdlpArgs.push('-f', 'bestvideo[height<=1080]+bestaudio/best[height<=1080]');
        } else {
          ytdlpArgs.push('-f', 'bestvideo[height<=720]+bestaudio/best[height<=720]');
        }
        ytdlpArgs.push('--merge-output-format', 'mp4');
      }

      // STAGE 3: TRANSCODING
      emitStatus(socket, 'TRANSCODING', 30, `Downloading and processing ${quality}...`);

      // Try to use yt-dlp command, fallback to python module
      const ytdlpCommand = process.env.RAILWAY_ENVIRONMENT ? 'python3' : 'yt-dlp';
      const ytdlpFinalArgs = process.env.RAILWAY_ENVIRONMENT ? ['-m', 'yt_dlp', ...ytdlpArgs] : ytdlpArgs;
      
      console.log('Spawning yt-dlp with command:', ytdlpCommand);
      console.log('Args:', ytdlpFinalArgs);
      
      const ytdlp = spawn(ytdlpCommand, ytdlpFinalArgs);
      let lastProgress = 30;

      ytdlp.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('yt-dlp:', output);
        
        // Parse progress from yt-dlp output
        const progressMatch = output.match(/(\d+\.\d+)%/);
        if (progressMatch) {
          const downloadProgress = parseFloat(progressMatch[1]);
          // Map 0-100% download to 30-90% UI progress
          lastProgress = Math.floor(30 + (downloadProgress * 0.6));
          emitStatus(socket, 'TRANSCODING', lastProgress, `Processing... ${downloadProgress.toFixed(1)}%`);
        }
      });

      let errorOutput = '';
      ytdlp.stderr.on('data', (data) => {
        const error = data.toString();
        errorOutput += error;
        console.error('yt-dlp error:', error);
        
        // Parse progress from stderr too (yt-dlp outputs progress there)
        const progressMatch = error.match(/(\d+\.\d+)%/);
        if (progressMatch) {
          const downloadProgress = parseFloat(progressMatch[1]);
          lastProgress = Math.floor(30 + (downloadProgress * 0.6));
          emitStatus(socket, 'TRANSCODING', lastProgress, `Processing... ${downloadProgress.toFixed(1)}%`);
        }
      });

      ytdlp.on('close', (code) => {
        if (code === 0) {
          // STAGE 4: COMPRESSING / FINALIZING
          emitStatus(socket, 'COMPRESSING', 95, 'Finalizing file...');
          
          setTimeout(() => {
            emitStatus(socket, 'COMPLETED', 100, 'Ready for download');
            const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
              ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` 
              : `http://localhost:${PORT}`;
            socket.emit('download-ready', { 
              url: `${baseUrl}/downloads/${jobId}.${extension}`,
              filename: `video_${jobId}.${extension}` 
            });
          }, 500);
        } else {
          console.error('yt-dlp failed with code:', code);
          console.error('yt-dlp error output:', errorOutput);
          const errorMsg = errorOutput.includes('Sign in') 
            ? 'Video requires sign-in or is age-restricted'
            : errorOutput.includes('Video unavailable')
            ? 'Video is unavailable or private'
            : errorOutput.includes('403')
            ? 'YouTube blocked the request. Try a different video.'
            : `Download failed: ${errorOutput.substring(0, 200)}`;
          emitStatus(socket, 'ERROR', 0, errorMsg);
        }
      });

      ytdlp.on('error', (err) => {
        console.error('yt-dlp spawn error:', err);
        emitStatus(socket, 'ERROR', 0, 'yt-dlp not found. Please install it: brew install yt-dlp');
      });

    } catch (error) {
      console.error('Download error:', error);
      emitStatus(socket, 'ERROR', 0, error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Serve downloads with proper headers to force download
app.get('/downloads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'downloads', filename);
  
  // Set headers to force download instead of opening in browser
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/octet-stream');
  
  // Send the file
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(404).json({ error: 'File not found' });
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'TubeGenius server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'TubeGenius Backend API',
    endpoints: {
      health: '/health',
      downloads: '/downloads'
    }
  });
});

const PORT = process.env.PORT || 4000;

console.log('🚀 Starting server...');
console.log(`📍 PORT from env: ${process.env.PORT}`);
console.log(`📍 Using PORT: ${PORT}`);
console.log(`📁 Downloads directory: ${downloadsDir}`);

server.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  console.log(`✅ TubeGenius backend server running on port ${PORT}`);
  console.log(`📁 Downloads will be saved to: ${downloadsDir}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Server is listening on 0.0.0.0:${PORT}`);
});
