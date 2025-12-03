import { DownloadOption } from "./types";

export const MOCK_DOWNLOAD_OPTIONS: DownloadOption[] = [
  { format: 'MP4', quality: '1080p', size: '145 MB', extension: 'mp4', isAudio: false },
  { format: 'MP4', quality: '720p', size: '85 MB', extension: 'mp4', isAudio: false },
  { format: 'MP4', quality: '480p', size: '42 MB', extension: 'mp4', isAudio: false },
  { format: 'MP3', quality: '320kbps', size: '8 MB', extension: 'mp3', isAudio: true },
  { format: 'WEBM', quality: '4K', size: '450 MB', extension: 'webm', isAudio: false },
];

export const PLACEHOLDER_THUMBNAIL = "https://picsum.photos/1280/720";
