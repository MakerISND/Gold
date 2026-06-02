import React from 'react';
import { Newspaper } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from './TechnicalGauge';

export function NewsFeed({ classifiedNews }: { classifiedNews: any[] }) {
  
  if (!classifiedNews || classifiedNews.length === 0) {
     return (
       <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 h-[400px] flex items-center justify-center">
         <span className="text-gray-500">Wait for news analysis...</span>
       </div>
     );
  }

  const getSentimentBadge = (sentiment: string) => {
    if (sentiment === "Bullish") return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    if (sentiment === "Bearish") return "bg-red-500/20 text-red-400 border border-red-500/30";
    return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
  };

  return (
    <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 shadow-xl w-full text-white flex flex-col h-full overflow-hidden">
       <div className="flex items-center gap-2 mb-6">
          <Newspaper size={20} className="text-[#D4AF37]" />
          <h2 className="text-lg font-medium text-gray-300 tracking-wide">Live Feeds <span className="text-sm text-gray-500 ml-1 font-normal">& Sentiment</span></h2>
       </div>

       <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-0 custom-scrollbar">
         {classifiedNews.map((news, i) => (
           <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-start gap-4 mb-2">
                 <h4 className="text-sm font-medium leading-snug text-gray-200 line-clamp-3">
                   {news.title}
                 </h4>
                 <div className="shrink-0 mt-0.5">
                   <span className={cn("text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-semibold", getSentimentBadge(news.sentiment))}>
                     {news.sentiment}
                   </span>
                 </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500 font-mono">
                 <span className="text-gray-400">{news.source || "Market Feed"}</span>
                 <span>{news.time ? formatDistanceToNow(new Date(news.time), { addSuffix: true }) : "Just now"}</span>
              </div>
           </div>
         ))}
       </div>
    </div>
  );
}
