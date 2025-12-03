# TubeGenius Backend Server

This is the backend server for TubeGenius that handles YouTube video downloading and processing using FFmpeg.

## Features

- Real-time WebSocket communication using Socket.IO
- YouTube video extraction using ytdl-core
- Video transcoding with FFmpeg
- Progress updates during processing
- CORS enabled for frontend communication

## Prerequisites

- Node.js (v14 or higher)
- FFmpeg installed on your system

## Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Running the Server

```bash
npm start
```

The server will start on `http://localhost:4000`

## API Endpoints

### WebSocket Events

**Client → Server:**
- `start-download`: Initiates video download
  ```javascript
  {
    url: "YouTube video URL",
    options: {
      format: "MP4",
      quality: "1080p"
    }
  }
  ```

**Server → Client:**
- `process-update`: Progress updates during processing
  ```javascript
  {
    stage: "CONNECTING" | "EXTRACTING" | "TRANSCODING" | "COMPRESSING" | "COMPLETED" | "ERROR",
    progress: 0-100,
    message: "Status message"
  }
  ```

- `download-ready`: Emitted when file is ready
  ```javascript
  {
    url: "Download URL",
    filename: "video_filename.mp4"
  }
  ```

### HTTP Endpoints

- `GET /health` - Health check endpoint
- `GET /downloads/:filename` - Serve downloaded files

## File Storage

Downloaded files are stored in the `downloads/` directory.

## Notes

- Make sure FFmpeg is installed: `brew install ffmpeg` (macOS) or `sudo apt-get install ffmpeg` (Ubuntu)
- The server accepts connections from localhost:3000 and localhost:5173 (Vite default ports)
- Files are named with timestamps to avoid conflicts
