import React from 'react';
import { VideoMetadata } from '../types';
import { Eye, Clock, User } from 'lucide-react';

interface VideoInfoProps {
  metadata: VideoMetadata;
}

export const VideoInfo: React.FC<VideoInfoProps> = ({ metadata }) => {
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
      <div className="aspect-video w-full relative group">
        <img 
          src={metadata.thumbnailUrl || "https://picsum.photos/1280/720"} 
          alt={metadata.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
            <span className="text-white font-semibold text-lg">Watch on YouTube</span>
        </div>
        <div className="absolute bottom-4 right-4 bg-black/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg">
          {metadata.length}
        </div>
      </div>
      
      <div className="p-8">
        <h2 className="text-3xl font-bold text-white mb-3 leading-tight line-clamp-2">
          {metadata.title}
        </h2>
        
        <div className="flex flex-wrap items-center gap-5 text-slate-400 text-sm mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-200 font-medium">{metadata.channel}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg">
            <Eye className="w-4 h-4 text-blue-400" />
            <span>{metadata.views} views</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{metadata.length}</span>
          </div>
        </div>

        <p className="text-slate-400 leading-relaxed line-clamp-3">
          {metadata.description}
        </p>
      </div>
    </div>
  );
};
