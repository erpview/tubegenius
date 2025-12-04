import React, { useState } from 'react';
import { Search, Loader2, Link2 } from 'lucide-react';

interface SearchBarProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-16 mb-16">
      <div className="text-center mb-12">
        <div className="inline-block mb-4">
          <span className="text-sm font-semibold text-blue-400 tracking-wider uppercase px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
            More Than A Downloader
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Download YouTube Videos
          </span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
          Empower your downloads with an all-in-one solution designed to streamline
          workflows, boost collaboration, and drive productivity.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative group mb-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2 shadow-2xl">
          <div className="pl-5 text-slate-500">
            <Link2 className="w-6 h-6" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube URL here..."
            className="flex-1 bg-transparent border-none outline-none text-white px-5 py-4 placeholder:text-slate-500 text-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Start for free</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
        <span className="px-4 py-2 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30 text-slate-400">✨ MP4 1080p</span>
        <span className="px-4 py-2 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30 text-slate-400">🎬 MP4 720p</span>
        <span className="px-4 py-2 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30 text-slate-400">🎵 MP3 Audio</span>
        <span className="px-4 py-2 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30 text-slate-400">⚡ Real-time Progress</span>
      </div>
    </div>
  );
};
