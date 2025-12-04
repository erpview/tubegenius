import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { VideoInfo } from './components/VideoInfo';
import { DownloadOptions } from './components/DownloadOptions';
import { AIAnalysis } from './components/AIAnalysis';
import { Footer } from './components/Footer';
import { TranscriptViewer } from './components/TranscriptViewer';
import { analyzeVideoUrl } from './services/geminiService';
import { VideoMetadata, AIAnalysisData, AppState } from './types';
import { AlertCircle } from 'lucide-react';
import io, { Socket } from 'socket.io-client';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
  const [analysisData, setAnalysisData] = useState<AIAnalysisData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [transcriptUrl, setTranscriptUrl] = useState<string | null>(null);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const fetchTranscript = (url: string) => {
    const BACKEND_URL = 'https://tubegenius-production.up.railway.app';
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: false
    });

    // Set a timeout in case transcript extraction takes too long
    const timeout = setTimeout(() => {
      console.log('Transcript extraction timeout - showing download options anyway');
      setShowDownloadOptions(true);
      socket.disconnect();
    }, 30000); // 30 second timeout

    socket.on('connect', () => {
      console.log('Connected to backend for transcript');
      socket.emit('get-transcript', { url });
    });

    socket.on('transcript-ready', ({ transcriptText, transcriptUrl: url, message }: any) => {
      clearTimeout(timeout);
      if (transcriptText) {
        console.log('Transcript received, length:', transcriptText.length);
        setTranscript(transcriptText);
        setTranscriptUrl(url);
        setShowDownloadOptions(true); // Show download options after transcript is ready
      } else {
        console.log('No transcript available:', message);
        setShowDownloadOptions(true); // Still show download options even if no transcript
      }
      socket.disconnect();
    });

    socket.on('connect_error', (error: any) => {
      clearTimeout(timeout);
      console.error('Socket connection error:', error);
      setShowDownloadOptions(true); // Show download options anyway
      socket.disconnect();
    });
  };

  const handleAnalyze = async (url: string) => {
    setAppState(AppState.ANALYZING);
    setErrorMsg("");
    setVideoData(null);
    setAnalysisData(null);

    try {
      // Sanitize URL - trim whitespace and fix common issues
      let cleanUrl = url.trim();
      // Fix double protocol (hhttps:// -> https://)
      cleanUrl = cleanUrl.replace(/^h+ttps?:\/\//, (match) => {
        return match.startsWith('https') ? 'https://' : 'http://';
      });
      
      // Validate YouTube URL
      const videoIdMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      
      if (!videoIdMatch) {
        setErrorMsg("Invalid YouTube URL. Please enter a valid YouTube video link.");
        setAppState(AppState.ERROR);
        return;
      }

      const videoId = videoIdMatch[1];
      
      // Create basic metadata without AI
      const metadata: VideoMetadata = {
        title: "YouTube Video",
        channel: "Loading...",
        views: "N/A",
        length: "N/A",
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        description: "Ready to download",
        url: cleanUrl
      };

      // Skip AI analysis - set minimal data
      const analysis: AIAnalysisData = {
        summary: "Download ready - AI analysis disabled",
        tags: [],
        sentiment: 'Neutral',
        sentimentScore: 50,
        keyTopics: [],
        transcript: []
      };

      setVideoData(metadata);
      setAnalysisData(analysis);
      setShowDownloadOptions(false); // Hide download options initially
      setTranscript(null);
      setTranscriptUrl(null);
      
      // Fetch transcript first
      fetchTranscript(cleanUrl);
      
      setAppState(AppState.READY);

    } catch (error) {
      console.error(error);
      setErrorMsg("An unexpected error occurred. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0e27] via-[#0f1629] to-[#1a1f3a] relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[80px] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'}}></div>
      
      <Header />
      
      <main className="flex-grow flex flex-col relative z-10">
        <div className="relative z-10">
          <SearchBar onAnalyze={handleAnalyze} isLoading={appState === AppState.ANALYZING} />
        </div>

        {appState === AppState.ERROR && (
          <div className="max-w-xl mx-auto w-full px-4 mb-8">
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-200 p-4 rounded-2xl flex items-center gap-3 shadow-2xl">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {appState === AppState.READY && videoData && (
          <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-6">
              <VideoInfo metadata={videoData} />
              
              {/* Show transcript first */}
              {transcript && transcriptUrl && (
                <TranscriptViewer
                  transcript={transcript}
                  transcriptUrl={transcriptUrl}
                  videoTitle={videoData.title}
                />
              )}
              
              {/* Show loading message while fetching transcript */}
              {!showDownloadOptions && !transcript && (
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 text-center">
                  <p className="text-slate-400">📝 Extracting transcript...</p>
                </div>
              )}
              
              {/* Show download options after transcript is ready */}
              {showDownloadOptions && (
                <DownloadOptions metadata={videoData} />
              )}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default App;