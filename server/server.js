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

// Function to extract transcript/captions from YouTube video
const extractTranscript = (url, jobId, socket, baseUrl) => {
  console.log('Extracting transcript for:', url);
  
  const downloadsDir = path.resolve(__dirname, 'downloads');
  
  // yt-dlp args to extract subtitles
  const transcriptArgs = [
    url,
    '--write-auto-sub',      // Auto-generated captions
    '--write-sub',           // Manual captions (preferred)
    '--sub-lang', 'en',      // English
    '--sub-format', 'vtt',   // Download as VTT (most compatible)
    '--skip-download',       // Don't download video again
    '--convert-subs', 'srt', // Convert to SRT (easier to parse than VTT)
    '--no-warnings',         // Reduce noise
    '-o', path.join(downloadsDir, `${jobId}`)
  ];
  
  const ytdlpCommand = process.env.RAILWAY_ENVIRONMENT ? 'python3' : 'yt-dlp';
  const ytdlpFinalArgs = process.env.RAILWAY_ENVIRONMENT 
    ? ['-m', 'yt_dlp', ...transcriptArgs] 
    : transcriptArgs;
  
  console.log('Running transcript extraction with:', ytdlpCommand, ytdlpFinalArgs.join(' '));
  
  const transcriptProcess = spawn(ytdlpCommand, ytdlpFinalArgs);
  
  let errorOutput = '';
  let stdOutput = '';
  
  transcriptProcess.stdout.on('data', (data) => {
    stdOutput += data.toString();
  });
  
  transcriptProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });
  
  transcriptProcess.on('close', (code) => {
    console.log('Transcript extraction finished with code:', code);
    
    // List all files in downloads directory for debugging
    try {
      const allFiles = fs.readdirSync(downloadsDir);
      const jobFiles = allFiles.filter(f => f.includes(jobId.toString()));
      console.log('Files found for job', jobId, ':', jobFiles);
    } catch (err) {
      console.error('Error listing files:', err);
    }
    
    // Check for various possible transcript filenames
    const possibleFiles = [
      `${jobId}.en.srt`,
      `${jobId}.en-US.srt`,
      `${jobId}.en-GB.srt`,
      `${jobId}.srt`,
      `${jobId}.en.vtt`,
      `${jobId}.en-US.vtt`,
      `${jobId}.vtt`
    ];
    
    let foundFile = null;
    for (const filename of possibleFiles) {
      const filePath = path.join(downloadsDir, filename);
      if (fs.existsSync(filePath)) {
        foundFile = { path: filePath, name: filename };
        console.log('Found transcript file:', filename);
        break;
      }
    }
    
    if (foundFile) {
      try {
        let transcriptText = fs.readFileSync(foundFile.path, 'utf-8');
        
        // Log first 2000 chars of raw SRT for debugging
        console.log('Raw SRT preview (first 2000 chars):', transcriptText.substring(0, 2000));
        
        // Convert SRT to readable text with timestamps (deduplicated)
        if (foundFile.name.endsWith('.srt')) {
          const entries = transcriptText.split('\n\n').map(block => {
            const lines = block.split('\n');
            if (lines.length >= 3) {
              const timestamp = lines[1].split(' --> ')[0];
              const text = lines.slice(2).join(' ').trim();
              return { timestamp, text };
            }
            return null;
          }).filter(entry => entry !== null);
          
          // Deduplicate: keep only the longest version of similar text
          const deduplicated = [];
          let lastText = '';
          for (const entry of entries) {
            if (entry.text.length === 0) continue;
            
            // Check if current text starts with or contains the previous text
            const currentStartsWithLast = entry.text.startsWith(lastText);
            const lastStartsWithCurrent = lastText.startsWith(entry.text);
            
            if (currentStartsWithLast && entry.text.length > lastText.length) {
              // Current is longer and builds on previous - replace the last entry
              if (deduplicated.length > 0) {
                deduplicated[deduplicated.length - 1] = `[${entry.timestamp}] ${entry.text}`;
              } else {
                deduplicated.push(`[${entry.timestamp}] ${entry.text}`);
              }
              lastText = entry.text;
            } else if (!lastStartsWithCurrent && entry.text !== lastText) {
              // Completely different text - add it
              deduplicated.push(`[${entry.timestamp}] ${entry.text}`);
              lastText = entry.text;
            }
            // Otherwise skip (it's a shorter duplicate)
          }
          transcriptText = deduplicated.join('\n');
        }
        
        // Convert VTT to readable text with timestamps (deduplicated)
        if (foundFile.name.endsWith('.vtt')) {
          const entries = transcriptText
            .replace(/WEBVTT\n\n/, '')
            .split('\n\n')
            .map(block => {
              const lines = block.split('\n');
              const timestampLine = lines.find(line => line.includes('-->'));
              const textLines = lines.filter(line => !line.includes('-->') && line.trim().length > 0);
              
              if (timestampLine && textLines.length > 0) {
                const timestamp = timestampLine.split(' --> ')[0].trim();
                const text = textLines.join(' ').trim();
                return { timestamp, text };
              }
              return null;
            })
            .filter(entry => entry !== null);
          
          // Deduplicate: keep only the longest version of similar text
          const deduplicated = [];
          let lastText = '';
          for (const entry of entries) {
            if (entry.text.length === 0) continue;
            
            // Check if current text starts with or contains the previous text
            const currentStartsWithLast = entry.text.startsWith(lastText);
            const lastStartsWithCurrent = lastText.startsWith(entry.text);
            
            if (currentStartsWithLast && entry.text.length > lastText.length) {
              // Current is longer and builds on previous - replace the last entry
              if (deduplicated.length > 0) {
                deduplicated[deduplicated.length - 1] = `[${entry.timestamp}] ${entry.text}`;
              } else {
                deduplicated.push(`[${entry.timestamp}] ${entry.text}`);
              }
              lastText = entry.text;
            } else if (!lastStartsWithCurrent && entry.text !== lastText) {
              // Completely different text - add it
              deduplicated.push(`[${entry.timestamp}] ${entry.text}`);
              lastText = entry.text;
            }
            // Otherwise skip (it's a shorter duplicate)
          }
          transcriptText = deduplicated.join('\n');
        }
        
        console.log('Transcript extracted successfully:', foundFile.name);
        
        socket.emit('transcript-ready', {
          transcriptUrl: `${baseUrl}/downloads/${foundFile.name}`,
          transcriptText: transcriptText,
          filename: `transcript_${jobId}.txt`
        });
      } catch (err) {
        console.error('Error reading transcript:', err);
        socket.emit('transcript-ready', {
          transcriptUrl: null,
          transcriptText: null,
          message: 'Error reading transcript file'
        });
      }
    } else {
      console.log('No captions available. Checked files:', possibleFiles);
      console.log('Stdout:', stdOutput);
      console.log('Stderr:', errorOutput);
      socket.emit('transcript-ready', {
        transcriptUrl: null,
        transcriptText: null,
        message: 'No captions available for this video'
      });
    }
  });
  
  transcriptProcess.on('error', (err) => {
    console.error('Transcript extraction error:', err);
    socket.emit('transcript-ready', {
      transcriptUrl: null,
      transcriptText: null,
      message: 'Transcript extraction failed'
    });
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
        // Use multiple player clients to bypass restrictions
        '--extractor-args', 'youtube:player_client=android,ios,web,mweb',
        '--extractor-args', 'youtube:skip=dash,hls',
        // Bypass age restrictions
        '--age-limit', '0',
        // Add cookies support (helps with sign-in required videos)
        '--mark-watched',
        '--no-warnings',
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
          // Small delay to ensure file is written
          setTimeout(() => {
            emitStatus(socket, 'COMPLETE', 100, 'Download complete!');
            const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
              ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` 
              : `http://localhost:${PORT}`;
            socket.emit('download-ready', { 
              url: `${baseUrl}/downloads/${jobId}.${extension}`,
              filename: `video_${jobId}.${extension}` 
            });
            
            // Don't extract transcript again - it was already done before download
          }, 500);
        } else {
          console.error('yt-dlp failed with code:', code);
          console.error('yt-dlp error output:', errorOutput);
          const errorMsg = errorOutput.includes('Sign in') || errorOutput.includes('age')
            ? 'YouTube blocked this video. This may be due to: age restrictions, sign-in requirements, or cloud server IP blocking. Try a different public video or use a local setup.'
            : errorOutput.includes('Video unavailable')
            ? 'Video is unavailable or private'
            : errorOutput.includes('403') || errorOutput.includes('HTTP Error 403')
            ? 'YouTube blocked the download request from this server. Try a different video or use a local setup.'
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

  // New event: Get transcript only (before download)
  socket.on('get-transcript', async ({ url }) => {
    console.log('Transcript request for:', url);
    
    try {
      // Validate YouTube URL
      if (!url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)) {
        throw new Error('Invalid YouTube URL');
      }

      const jobId = Date.now();
      const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` 
        : `http://localhost:${PORT}`;
      
      // Extract transcript immediately
      extractTranscript(url, jobId, socket, baseUrl);
      
    } catch (error) {
      console.error('Transcript extraction error:', error);
      socket.emit('transcript-ready', {
        transcriptUrl: null,
        transcriptText: null,
        message: error.message || 'Failed to extract transcript'
      });
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
  
  // Set appropriate headers based on file type
  if (filename.endsWith('.txt')) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  } else {
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
  }
  
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
