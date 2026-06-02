import React, { useState, useEffect } from 'react';
import { X, Key, Activity, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { geminiKey: string; symbol: string }) => void;
  currentSettings: { geminiKey: string; symbol: string };
}

export function SettingsModal({ isOpen, onClose, onSave, currentSettings }: SettingsModalProps) {
  const [geminiKey, setGeminiKey] = useState(currentSettings.geminiKey);
  const [symbol, setSymbol] = useState(currentSettings.symbol);

  useEffect(() => {
    if (isOpen) {
      setGeminiKey(currentSettings.geminiKey);
      setSymbol(currentSettings.symbol);
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ geminiKey, symbol });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-medium tracking-tight text-white mb-1">Back Office</h2>
          <p className="text-sm text-gray-500">Configure connection settings and parameters</p>
        </div>

        <div className="space-y-5">
           <div>
             <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
               <Key size={16} className="text-[#D4AF37]" />
               Gemini API Key
             </label>
             <input
               type="password"
               value={geminiKey}
               onChange={(e) => setGeminiKey(e.target.value)}
               placeholder="Enter API Key (optional fallback)"
               className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
             />
             <p className="text-xs text-gray-500 mt-2">Optional if injected by environment. Used for AI sentiment prediction.</p>
           </div>

           <div>
             <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
               <Activity size={16} className="text-[#D4AF37]" />
               TradingView Symbol
             </label>
             <input
               type="text"
               value={symbol}
               onChange={(e) => setSymbol(e.target.value)}
               placeholder="e.g. OANDA:XAUUSD"
               className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] uppercase transition-all"
             />
             <p className="text-xs text-gray-500 mt-2">The trading pair symbol used for live charting.</p>
           </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center gap-2 transition-all"
          >
            <Save size={16} />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
