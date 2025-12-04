import React, { useState, useRef } from 'react';
import { DownloadOption, VideoMetadata, BackendProcessStatus } from '../types';
import { MOCK_DOWNLOAD_OPTIONS } from '../constants';
import { BackendProcessor } from '../services/mockBackendService';
import { Download, Check, FileVideo, Music, Loader, Server, XCircle } from 'lucide-react';

interface DownloadOptionsProps {
  metadata: VideoMetadata;
}

export const DownloadOptions: React.FC<DownloadOptionsProps> = ({ metadata }) => {
  const [activeDownloadIdx, setActiveDownloadIdx] = useState<number | null>(null);
  const [completedIdx, setCompletedIdx] = useState<number | null>(null);
  const [status, setStatus] = useState<BackendProcessStatus | null>(null);
  
  // Use a ref to keep track of the current processor instance so we can cancel it if needed
  const processorRef = useRef<BackendProcessor | null>(null);

  const handleDownload = async (index: number) => {
    if (activeDownloadIdx !== null) return;
    
    setActiveDownloadIdx(index);
    setCompletedIdx(null);
    setStatus({ stage: 'QUEUED', progress: 0, message: 'Initializing...' });

    const option = MOCK_DOWNLOAD_OPTIONS[index];
    const processor = new BackendProcessor();
    processorRef.current = processor;

    try {
      const url = await processor.startProcessing(metadata, option, (newStatus) => {
        setStatus(newStatus);
        // Transcript is now handled in App.tsx, not here
      });

      // Trigger Browser Download
      const a = document.createElement('a');
      a.href = url;
      const safeTitle = metadata.title.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
      a.download = `${safeTitle}_${option.quality}.${option.extension}`;
      document.body.appendChild(a);
      a.click();
      // Only revoke if it's a blob URL (not a server URL)
      if (url.startsWith('blob:')) {
        window.URL.revokeObjectURL(url);
      }
      document.body.removeChild(a);

      setCompletedIdx(index);
      setTimeout(() => {
         // Only reset if we are still on this item (user hasn't started another)
         setCompletedIdx((current) => current === index ? null : current);
      }, 3000);

    } catch (e) {
      console.error("Download failed", e);
      const errorMessage = e instanceof Error ? e.message : 'Download failed';
      
      // Provide helpful message for age-restricted videos
      const friendlyMessage = errorMessage.includes('age-restricted') || errorMessage.includes('sign-in')
        ? 'This video is age-restricted or requires sign-in. Try a different public video.'
        : errorMessage;
      
      setStatus({ 
        stage: 'ERROR', 
        progress: 0, 
        message: friendlyMessage
      });
      // Show error for 8 seconds
      setTimeout(() => {
        setActiveDownloadIdx(null);
        setStatus(null);
        processorRef.current = null;
      }, 8000);
    }
  };

  const cancelDownload = () => {
      if (processorRef.current) {
          processorRef.current.cancel();
          processorRef.current = null;
      }
      setActiveDownloadIdx(null);
      setStatus(null);
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-black/50 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
            <Download className="w-5 h-5 text-white" />
          </div>
          Download Options
        </h3>
        <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg font-medium">
            Free for personal use
        </span>
      </div>

      <div className="space-y-3 flex-grow">
        {MOCK_DOWNLOAD_OPTIONS.map((option, index) => {
          const isActive = activeDownloadIdx === index;
          const isCompleted = completedIdx === index;
          const isOtherActive = activeDownloadIdx !== null && activeDownloadIdx !== index;

          return (
            <div 
              key={index}
              className={`
                group flex flex-col p-4 rounded-2xl border transition-all duration-300
                ${isActive 
                  ? 'bg-slate-800/80 border-blue-500/50 shadow-xl shadow-blue-900/20' 
                  : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50'
                }
                ${isOtherActive ? 'opacity-50 blur-[1px]' : 'opacity-100'}
              `}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                      isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/50' : 
                      option.isAudio ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {isActive ? <Server className="w-6 h-6 animate-pulse" /> : 
                     option.isAudio ? <Music className="w-6 h-6" /> : <FileVideo className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{option.quality}</span>
                        <span className="text-xs font-mono text-slate-500 uppercase px-1.5 py-0.5 bg-slate-800 rounded">{option.extension}</span>
                    </div>
                    <div className="text-xs text-slate-500">{option.size}</div>
                  </div>
                </div>

                {isActive ? (
                   <button 
                     onClick={cancelDownload}
                     className="text-xs text-red-400 hover:text-red-300 underline decoration-red-400/30 underline-offset-2 flex items-center gap-1"
                   >
                     <XCircle className="w-3 h-3" /> Cancel
                   </button>
                ) : (
                  <button
                    onClick={() => handleDownload(index)}
                    disabled={activeDownloadIdx !== null}
                    className={`
                      relative overflow-hidden px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 min-w-[120px] flex justify-center items-center
                      ${isCompleted 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <div className="flex items-center gap-2 animate-in fade-in zoom-in">
                        <Check className="w-4 h-4" />
                        <span>Saved</span>
                      </div>
                    ) : (
                      <span>Download</span>
                    )}
                  </button>
                )}
              </div>

              {/* Backend Process Progress Bar */}
              {isActive && status && (
                <div className="mt-3 pl-[56px] animate-in fade-in slide-in-from-top-2">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider">
                         {status.stage}...
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                         {status.progress}%
                      </span>
                   </div>
                   <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-300 ease-out shadow-lg shadow-blue-500/50"
                        style={{ width: `${status.progress}%` }}
                      ></div>
                   </div>
                   <p className="text-[10px] text-slate-500 mt-1 truncate">
                     {status.message}
                   </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};