import React, { useState } from 'react';
import { AIAnalysisData } from '../types';
import { Sparkles, Hash, BarChart3, MessageSquareQuote, FileText, PlayCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AIAnalysisProps {
  data: AIAnalysisData;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'transcript'>('insights');
  const sentimentColor = data.sentiment === 'Positive' ? '#22c55e' : data.sentiment === 'Negative' ? '#ef4444' : '#eab308';
  
  const chartData = [
    { name: 'Score', value: data.sentimentScore },
    { name: 'Remaining', value: 100 - data.sentimentScore }
  ];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden backdrop-blur-sm h-full flex flex-col">
      {/* Tab Header */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
            activeTab === 'insights'
              ? 'bg-slate-800/80 text-white border-b-2 border-red-500'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Insights
        </button>
        <button
          onClick={() => setActiveTab('transcript')}
          className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
            activeTab === 'transcript'
              ? 'bg-slate-800/80 text-white border-b-2 border-red-500'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <FileText className="w-4 h-4" />
          Smart Transcript
        </button>
      </div>

      <div className="p-6 flex-grow">
        {activeTab === 'insights' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Summary Section */}
            <div className="col-span-1 md:col-span-2 space-y-3">
              <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <MessageSquareQuote className="w-4 h-4" /> Summary
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {data.summary}
                </p>
              </div>
            </div>

            {/* Sentiment Analysis */}
            <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700/50 flex flex-col items-center justify-center relative">
               <div className="absolute top-4 left-4 text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Sentiment
              </div>
              <div className="h-32 w-32 relative mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      startAngle={180}
                      endAngle={0}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell key="score" fill={sentimentColor} />
                      <Cell key="rest" fill="#334155" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                  <span className="text-2xl font-bold text-white">{data.sentimentScore}%</span>
                  <span className="text-[10px] text-slate-400 uppercase">{data.sentiment}</span>
                </div>
              </div>
            </div>

            {/* Key Topics / Tags */}
            <div className="space-y-4">
               <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Hash className="w-4 h-4" /> Smart Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-sm rounded-lg border border-slate-700 hover:border-slate-500 transition-colors cursor-default">
                    #{tag}
                  </span>
                ))}
              </div>
               <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mt-4">Key Topics</div>
                <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                    {data.keyTopics.map((topic, i) => (
                        <li key={i}>{topic}</li>
                    ))}
                </ul>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Generated Key Moments</h3>
                <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  AI Generated
                </span>
             </div>
             
             {data.transcript && data.transcript.length > 0 ? (
               <div className="space-y-0 relative border-l border-slate-700 ml-3">
                 {data.transcript.map((item, idx) => (
                   <div key={idx} className="relative pl-8 pb-8 last:pb-0 group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700 group-hover:bg-red-500 transition-colors border border-slate-900"></div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                        <span className="text-red-400 font-mono text-sm font-semibold min-w-[50px] flex items-center gap-1">
                          <PlayCircle className="w-3 h-3 inline sm:hidden" />
                          {item.timestamp}
                        </span>
                        <p className="text-slate-300 text-sm leading-relaxed group-hover:text-white transition-colors">
                          {item.text}
                        </p>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                 <FileText className="w-10 h-10 mb-3 opacity-20" />
                 <p>No transcript data available for this video.</p>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};