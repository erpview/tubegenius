import React from 'react';
import { Youtube, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-5 px-6 sm:px-12 flex justify-between items-center border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-2xl sticky top-0 z-50">
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-600 blur-md opacity-50 group-hover:opacity-70 transition-opacity rounded-full"></div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center relative z-10 shadow-lg shadow-blue-500/50">
            <Youtube className="w-5 h-5 text-white" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-white">
          TubeGenius
        </h1>
      </div>
      
    </header>
  );
};
