import React from 'react';
import { Target, AlertTriangle, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from './TechnicalGauge';

export function PredictionPanel({ analysis }: { analysis: any }) {
  if (!analysis) {
    return <div className="animate-pulse bg-gray-900 rounded-2xl h-[400px] w-full"></div>;
  }

  const { prediction, marketSentimentScore, sentimentBreakdown } = analysis;

  const trendColor = prediction?.trend === "Up" ? "text-emerald-400" : prediction?.trend === "Down" ? "text-red-400" : "text-yellow-400";
  const bgTrendColor = prediction?.trend === "Up" ? "bg-emerald-500/10 border-emerald-500/20" : prediction?.trend === "Down" ? "bg-red-500/10 border-red-500/20" : "bg-yellow-500/10 border-yellow-500/20";
  
  const TrendIcon = prediction?.trend === "Up" ? TrendingUp : prediction?.trend === "Down" ? TrendingDown : Minus;

  return (
    <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 shadow-xl w-full text-white">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
        <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
          <Target size={24} className="text-[#D4AF37]" />
        </div>
        <div>
          <h2 className="text-xl font-medium tracking-tight">AI Trend Prediction</h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Next 30 Minutes</p>
        </div>
      </div>

      <div className={cn("rounded-xl border p-6 flex flex-col items-center justify-center relative overflow-hidden mb-6", bgTrendColor)}>
        {/* Glow effect */}
        <div className={cn("absolute -top-10 -left-10 w-32 h-32 blur-[60px] opacity-30", prediction?.trend === "Up" ? "bg-emerald-500" : "bg-red-500")} />
        
        <div className="flex items-center gap-4 z-10">
          <TrendIcon size={48} className={trendColor} />
          <div className="flex flex-col">
            <span className={cn("text-5xl border-transparent font-bold tracking-tighter uppercase drop-shadow-md", trendColor)}>
              {prediction?.trend}
            </span>
            <div className="flex items-center mt-2 group relative cursor-help">
              <span className="text-sm font-medium text-gray-300">Confidence: </span>
              <span className="ml-2 text-lg font-mono font-bold text-white tracking-tight">{prediction?.confidence}%</span>
              <div className="hidden group-hover:block absolute top-8 left-0 bg-gray-800 text-xs p-2 rounded w-48 shadow-lg border border-gray-700 z-20">
                Confidence is calculated by aggregating technical bias convergence and semantic market news sentiment.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm text-gray-400 font-medium">AI Reasoning Engine</h3>
        <ul className="space-y-3">
          {prediction?.reasoning?.map((reason: string, i: number) => (
            <li key={i} className="flex gap-3 text-sm text-gray-300 items-start">
              <div className="shrink-0 mt-0.5">
               <AlertCircle size={16} className="text-[#D4AF37]" />
              </div>
              <span className="leading-snug">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Market Sentiment Summary below prediction */}
      <div className="mt-8 pt-6 border-t border-gray-800">
        <div className="flex justify-between items-end mb-3">
         <h3 className="text-sm text-gray-400 font-medium">News Sentiment Score</h3>
         <span className={cn("text-xl font-mono font-bold", marketSentimentScore > 50 ? "text-emerald-400" : "text-red-400")}>
           {marketSentimentScore}/100
         </span>
        </div>
        
        {/* Sentiment Progress Bar */}
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${sentimentBreakdown?.bullish || 0}%` }} title="Bullish" />
          <div className="bg-yellow-500 h-full transition-all duration-1000" style={{ width: `${sentimentBreakdown?.neutral || 0}%` }} title="Neutral" />
          <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${sentimentBreakdown?.bearish || 0}%` }} title="Bearish" />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
          <span>{sentimentBreakdown?.bullish}% Bullish</span>
          <span>{sentimentBreakdown?.bearish}% Bearish</span>
        </div>
      </div>
    </div>
  );
}
