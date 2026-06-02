import React from 'react';
import { ShieldAlert, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function TechnicalGauge({ taData }: { taData: any }) {
  if (!taData) {
    return <div className="animate-pulse bg-gray-900 rounded-2xl h-64 w-full"></div>;
  }

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case "Strong Buy": return "text-[#00FF7F] drop-shadow-[0_0_10px_rgba(0,255,127,0.5)]";
      case "Buy": return "text-emerald-400";
      case "Strong Sell": return "text-[#FF3333] drop-shadow-[0_0_10px_rgba(255,51,51,0.5)]";
      case "Sell": return "text-red-400";
      default: return "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]";
    }
  };

  const getBiasIcon = (bias: string) => {
    switch (bias) {
      case "Strong Buy":
      case "Buy": return <TrendingUp className={getBiasColor(bias)} size={32} />;
      case "Strong Sell":
      case "Sell": return <TrendingDown className={getBiasColor(bias)} size={32} />;
      default: return <Minus className={getBiasColor(bias)} size={32} />;
    }
  };

  return (
    <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 shadow-xl w-full text-white flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-300 flex items-center gap-2">
          <Activity size={20} className="text-[#D4AF37]" />
          Technical Summary <span className="text-xs ml-2 text-gray-500 font-mono">(Live)</span>
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center py-6 border-b border-white/5 mb-4">
        <div className="flex items-center gap-4">
          {getBiasIcon(taData.gaugeBias)}
          <span className={cn("text-4xl font-bold tracking-tighter uppercase", getBiasColor(taData.gaugeBias))}>
            {taData.gaugeBias}
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-2">Aggregate Bias (15m Interval)</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-lg">
          <span className="text-gray-400">RSI(14)</span>
          <span className={cn("font-mono font-medium", Number(taData.indicators.rsi) > 60 ? "text-red-400" : Number(taData.indicators.rsi) < 40 ? "text-emerald-400" : "text-yellow-500")}>
            {taData.indicators.rsi}
          </span>
        </div>
        <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-lg">
          <span className="text-gray-400">MACD</span>
          <span className={cn("font-mono font-medium", Number(taData.indicators.macd) > 0 ? "text-emerald-400" : "text-red-400")}>
            {taData.indicators.macd}
          </span>
        </div>
        <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-lg">
          <span className="text-gray-400">EMA(20)</span>
          <span className="font-mono text-gray-200">{taData.indicators.ema20}</span>
        </div>
        <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-lg">
          <span className="text-gray-400">EMA(50)</span>
          <span className="font-mono text-gray-200">{taData.indicators.ema50}</span>
        </div>
      </div>
    </div>
  );
}
