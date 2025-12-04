import React, { useState } from 'react';
import { Copy, Download, FileText, Check } from 'lucide-react';

interface TranscriptViewerProps {
  transcript: string;
  transcriptUrl: string;
  videoTitle: string;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  transcript,
  transcriptUrl,
  videoTitle
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Limit preview to first 500 characters
  const previewText = transcript.substring(0, 500);
  const hasMore = transcript.length > 500;

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/50">
            <FileText className="w-5 h-5 text-white" />
          </div>
          Transcript
        </h3>
        <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg font-medium">
          Auto-generated
        </span>
      </div>

      {/* Transcript Text */}
      <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 max-h-96 overflow-y-auto border border-slate-700/30">
        <pre className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
          {expanded ? transcript : previewText}
          {!expanded && hasMore && '...'}
        </pre>
        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium underline underline-offset-2"
          >
            Show more
          </button>
        )}
        {expanded && hasMore && (
          <button
            onClick={() => setExpanded(false)}
            className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium underline underline-offset-2"
          >
            Show less
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              <span>Copy Transcript</span>
            </>
          )}
        </button>
        
        <a
          href={transcriptUrl}
          download={`transcript_${videoTitle.replace(/[^a-z0-9]/gi, '_').substring(0, 30)}.txt`}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold hover:scale-105 transition-all"
        >
          <Download className="w-5 h-5" />
          <span>Download .txt</span>
        </a>
      </div>

      {/* Info */}
      <p className="text-slate-500 text-xs mt-4">
        💡 Transcript extracted from YouTube captions. Accuracy may vary.
      </p>
    </div>
  );
};
