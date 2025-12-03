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
      setStatus({ 
        stage: 'ERROR', 
        progress: 0, 
        message: e instanceof Error ? e.message : 'Download failed' 
      });
      // Show error for 5 seconds
      setTimeout(() => {
        setActiveDownloadIdx(null);
        setStatus(null);
        processorRef.current = null;
      }, 5000);
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
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-red-500" />
          Download Media
        </h3>
        <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded">
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
                group flex flex-col p-3 rounded-lg border transition-all duration-300
                ${isActive 
                  ? 'bg-slate-800 border-red-500/50 shadow-lg shadow-red-900/10' 
                  : 'bg-slate-900/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                }
                ${isOtherActive ? 'opacity-50 blur-[1px]' : 'opacity-100'}
              `}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isActive ? 'bg-red-500 text-white' : 
                      option.isAudio ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {isActive ? <Server className="w-5 h-5 animate-pulse" /> : 
                     option.isAudio ? <Music className="w-5 h-5" /> : <FileVideo className="w-5 h-5" />}
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
                      relative overflow-hidden px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 min-w-[100px] flex justify-center items-center
                      ${isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-slate-700 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-900/20 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500'
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
                   <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-300 ease-out"
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