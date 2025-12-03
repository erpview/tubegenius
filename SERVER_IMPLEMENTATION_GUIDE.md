# Server-Side Implementation Guide for TubeGenius

Currently, the TubeGenius frontend (`src/services/mockBackendService.ts`) simulates the video download and transcoding process. To make this application fully functional, you need to implement a real backend server.

This guide outlines the architecture and code required to build the Node.js backend that handles YouTube extraction, FFmpeg transcoding, and real-time WebSocket progress updates.

## 1. Architecture Overview

To match the frontend's visual "Process Stages" (`CONNECTING` -> `EXTRACTING` -> `TRANSCODING` -> `COMPRESSING`), we need a real-time bi-directional connection.

*   **Protocol**: WebSockets (using `socket.io`).
*   **Core Logic**: `ytdl-core` (or `yt-dlp` wrapper) for extraction, `fluent-ffmpeg` for transcoding.
*   **Server**: Node.js with Express.

## 2. Prerequisites

You will need a server environment with **FFmpeg** installed.

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install ffmpeg

# MacOS
brew install ffmpeg
```

## 3. Project Setup

Create a new directory `server/` and initialize it:

```bash
mkdir server && cd server
npm init -y
npm install express socket.io fluent-ffmpeg ytdl-core cors
```

## 4. Server Implementation (`server.js`)

Create a `server.js` file. This code maps directly to the `ProcessStage` types defined in the frontend `types.ts`.

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

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
    const outputPath = path.resolve(__dirname, 'downloads', `${jobId}.${format.toLowerCase()}`);

    try {
      // STAGE 1: CONNECTING
      emitStatus(socket, 'CONNECTING', 5, 'Handshaking with media server...');
      
      if (!ytdl.validateURL(url)) {
        throw new Error('Invalid YouTube URL');
      }

      // STAGE 2: EXTRACTING
      emitStatus(socket, 'EXTRACTING', 15, 'Extracting video stream info...');
      const info = await ytdl.getInfo(url);
      const videoTitle = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_');

      // STAGE 3: TRANSCODING
      emitStatus(socket, 'TRANSCODING', 20, `Initializing FFmpeg for ${quality}...`);

      const stream = ytdl(url, { quality: 'highestvideo' });

      ffmpeg(stream)
        .format(format.toLowerCase())
        .size(quality === '1080p' ? '1920x1080' : '1280x720') // specific scaling
        .on('progress', (p) => {
          // Map FFmpeg progress to our 20-90% range
          const percent = 20 + (p.percent ? (p.percent * 0.7) : 0); 
          emitStatus(socket, 'TRANSCODING', Math.floor(percent), `Transcoding frame ${p.frames}...`);
        })
        .on('end', () => {
          // STAGE 4: COMPRESSING / FINALIZING
          emitStatus(socket, 'COMPRESSING', 95, 'Finalizing file structure...');
          
          setTimeout(() => {
             emitStatus(socket, 'COMPLETED', 100, 'Ready for download');
             socket.emit('download-ready', { 
               url: `http://localhost:4000/downloads/${jobId}.${format.toLowerCase()}`,
               filename: `${videoTitle}.${format.toLowerCase()}` 
             });
          }, 1000);
        })
        .on('error', (err) => {
          console.error(err);
          emitStatus(socket, 'ERROR', 0, 'Transcoding failed');
        })
        .save(outputPath);

    } catch (error) {
      emitStatus(socket, 'ERROR', 0, error.message);
    }
  });
});

// Serve static files for download
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
```

## 5. Frontend Integration Update

To connect your existing React app to this new backend, you would modify `services/mockBackendService.ts` to use `socket.io-client` instead of `setTimeout`.

**Example modification for `services/mockBackendService.ts`:**

```typescript
import { io, Socket } from 'socket.io-client';

export class BackendProcessor {
  private socket: Socket | null = null;

  public startProcessing(metadata, option, onUpdate): Promise<string> {
    return new Promise((resolve, reject) => {
      // Connect to real backend
      this.socket = io('http://localhost:4000');

      this.socket.emit('start-download', { 
        url: metadata.url, // You'll need to pass the URL through
        options: option 
      });

      this.socket.on('process-update', (status) => {
        onUpdate(status);
        if (status.stage === 'ERROR') reject(status.message);
      });

      this.socket.on('download-ready', ({ url }) => {
        resolve(url);
        this.socket?.disconnect();
      });
    });
  }
  
  public cancel() {
    this.socket?.disconnect();
  }
}
```

## 6. Docker Deployment (Recommended)

Since FFmpeg is a system dependency, Docker is the best way to deploy this to production (e.g., AWS ECS, DigitalOcean App Platform, or Railway).

**`Dockerfile`**:
```dockerfile
FROM node:18-alpine

# Install FFmpeg
RUN apk update && apk add ffmpeg

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000
CMD ["node", "server.js"]
```

## 7. Legal Note

Ensure you comply with YouTube's Terms of Service when implementing the actual download logic. This code is for educational purposes to demonstrate the architecture of a media processing pipeline.
