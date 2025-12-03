import React, { useState } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { VideoInfo } from './components/VideoInfo';
import { DownloadOptions } from './components/DownloadOptions';
import { AIAnalysis } from './components/AIAnalysis';
import { Footer } from './components/Footer';
import { analyzeVideoUrl } from './services/geminiService';
import { AppState, VideoMetadata, AIAnalysisData } from './types';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
  const [analysisData, setAnalysisData] = useState<AIAnalysisData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleAnalyze = async (url: string) => {
    setAppState(AppState.ANALYZING);
    setErrorMsg("");
    setVideoData(null);
    setAnalysisData(null);

    try {
      // Validate YouTube URL
      const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      
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
        url: url
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
      setAppState(AppState.READY);

    } catch (error) {
      console.error(error);
      setErrorMsg("An unexpected error occurred. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
      <Header />
      
      <main className="flex-grow flex flex-col">
        <div className="relative z-10">
          <SearchBar onAnalyze={handleAnalyze} isLoading={appState === AppState.ANALYZING} />
        </div>

        {appState === AppState.ERROR && (
          <div className="max-w-xl mx-auto w-full px-4 mb-8">
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {appState === AppState.READY && videoData && (
          <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-6">
              <VideoInfo metadata={videoData} />
              <DownloadOptions metadata={videoData} />
            </div>
          </div>
        )}
        
        {/* Empty State / Decorative Background Elements */}
        {appState === AppState.IDLE && (
           <div className="flex-1 flex items-center justify-center opacity-20 pointer-events-none overflow-hidden absolute inset-0 z-0">
             <div className="w-[800px] h-[800px] bg-red-600 rounded-full blur-[150px] opacity-10 translate-y-1/2"></div>
             <div className="w-[600px] h-[600px] bg-blue-600 rounded-full blur-[120px] opacity-10 -translate-x-1/4 -translate-y-1/4"></div>
           </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default App;