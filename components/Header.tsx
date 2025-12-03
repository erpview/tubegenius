import React from 'react';
import { Youtube, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 sm:px-8 flex justify-between items-center border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2 group cursor-pointer">
        <div className="relative">
          <div className="absolute inset-0 bg-red-600 blur opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>
          <Youtube className="w-8 h-8 text-red-500 relative z-10" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          TubeGenius
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">How it works</a>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-full text-sm font-medium transition-all">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>Pro Features</span>
        </button>
      </div>
    </header>
  );
};
