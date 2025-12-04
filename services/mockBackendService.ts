import { VideoMetadata, DownloadOption, BackendProcessStatus, ProcessStage } from "../types";
import { io, Socket } from 'socket.io-client';

/**
 * Real backend video processing pipeline using WebSocket connection.
 * Connects to Node.js server running FFmpeg tasks.
 */

export class BackendProcessor {
  private socket: Socket | null = null;

  constructor() {}

  public cancel() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public async startProcessing(
    metadata: VideoMetadata,
    option: DownloadOption,
    onUpdate: (status: BackendProcessStatus) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Check if URL is available
      if (!metadata.url) {
        reject(new Error('Video URL is required for processing'));
        return;
      }

      // Connect to real backend
      const BACKEND_URL = 'https://tubegenius-production.up.railway.app';
      this.socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnection: false
      });

      // Handle successful connection
      this.socket.on('connect', () => {
        console.log('Connected to backend server');
        // Emit start-download event after connection is established
        this.socket?.emit('start-download', { 
          url: metadata.url,
          options: option 
        });
      });

      // Handle connection errors
      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.socket?.disconnect();
        reject(new Error('Failed to connect to backend server. Make sure the server is running on port 4000.'));
      });

      // Listen for process updates
      this.socket.on('process-update', (status: BackendProcessStatus) => {
        onUpdate(status);
        if (status.stage === 'ERROR') {
          reject(new Error(status.message));
          this.socket?.disconnect();
        }
      });

      // Listen for download ready
      this.socket.on('download-ready', ({ url }: { url: string }) => {
        resolve(url);
        // Don't disconnect yet - wait for transcript
      });

      // Listen for transcript ready
      this.socket.on('transcript-ready', ({ transcriptText, transcriptUrl, message }: any) => {
        if (transcriptText) {
          onUpdate({
            stage: 'COMPLETED',
            progress: 100,
            message: 'Transcript extracted!',
            transcript: transcriptText,
            transcriptUrl: transcriptUrl
          });
        } else {
          onUpdate({
            stage: 'COMPLETED',
            progress: 100,
            message: message || 'No captions available',
            transcript: null,
            transcriptUrl: null
          });
        }
        // Now disconnect
        this.socket?.disconnect();
      });
    });
  }
}