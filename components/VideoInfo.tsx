import React from 'react';
import { VideoMetadata } from '../types';
import { Eye, Clock, User } from 'lucide-react';

interface VideoInfoProps {
  metadata: VideoMetadata;
}

export const VideoInfo: React.FC<VideoInfoProps> = ({ metadata }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden backdrop-blur-sm">
      <div className="aspect-video w-full relative group">
        <img 
          src={metadata.thumbnailUrl || "https://picsum.photos/1280/720"} 
          alt={metadata.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <span className="text-white font-medium">Watch on YouTube</span>
        </div>
        <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
          {metadata.length}
        </div>
      </div>
      
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-2 leading-tight line-clamp-2">
          {metadata.title}
        </h2>
        
        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-4">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-red-400" />
            <span className="text-slate-200">{metadata.channel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>{metadata.views} views</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{metadata.length}</span>
          </div>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
          {metadata.description}
        </p>
      </div>
    </div>
  );
};
