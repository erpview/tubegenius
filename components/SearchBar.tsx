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
    <div className="w-full max-w-3xl mx-auto px-4 mt-12 mb-12">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          Download <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
            YouTube Videos
          </span>
        </h2>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Paste a YouTube link to download in multiple formats (MP4, MP3) with real-time processing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl">
          <div className="pl-4 text-slate-500">
            <Link2 className="w-6 h-6" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube URL here..."
            className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder:text-slate-500 text-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Start</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm text-slate-500">
        <span className="px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">MP4 1080p</span>
        <span className="px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">MP4 720p</span>
        <span className="px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">MP3 Audio</span>
        <span className="px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">Real-time Progress</span>
      </div>
    </div>
  );
};
