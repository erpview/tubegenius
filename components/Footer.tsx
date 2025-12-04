import React from 'react';
import { Github, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-900/50 backdrop-blur text-slate-400 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm">
          © {new Date().getFullYear()} TubeGenius. All rights reserved.
        </div>
        
        <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
        </div>
      </div>
    </footer>
  );
};
