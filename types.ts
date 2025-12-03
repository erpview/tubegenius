export interface VideoMetadata {
  title: string;
  channel: string;
  views: string;
  length: string;
  thumbnailUrl: string;
  description: string;
  url?: string; // YouTube URL for backend processing
}

export interface TranscriptSegment {
  timestamp: string;
  text: string;
}

export interface AIAnalysisData {
  summary: string;
  tags: string[];
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  sentimentScore: number; // 0-100
  keyTopics: string[];
  transcript: TranscriptSegment[];
}

export interface DownloadOption {
  format: string;
  quality: string;
  size: string;
  extension: string;
  isAudio: boolean;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export type ProcessStage = 'QUEUED' | 'CONNECTING' | 'EXTRACTING' | 'TRANSCODING' | 'COMPRESSING' | 'FINALIZING' | 'COMPLETED' | 'ERROR';

export interface BackendProcessStatus {
  stage: ProcessStage;
  progress: number;
  message: string;
}