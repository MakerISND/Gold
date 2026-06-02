import { useEffect, useState } from 'react';
import TradingViewWidget from './components/TradingViewWidget';
import { TechnicalGauge } from './components/TechnicalGauge';
import { PredictionPanel } from './components/PredictionPanel';
import { NewsFeed } from './components/NewsFeed';
import { SettingsModal } from './components/SettingsModal';
import { RefreshCw, Activity, Zap, Settings } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<{ ta: any, analysis: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Load settings from localStorage or defaults
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('xau-terminal-settings');
    if (saved) return JSON.parse(saved);
    return { geminiKey: "", symbol: "OANDA:XAUUSD" };
  });

  const handleSaveSettings = (newSettings: { geminiKey: string; symbol: string }) => {
    setSettings(newSettings);
    localStorage.setItem('xau-terminal-settings', JSON.stringify(newSettings));
    // Re-fetch with new API key if provided
    fetchState(newSettings);
  };

  const fetchState = async (currentSettings = settings) => {
    try {
      setLoading(true);
      const res = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentSettings)
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to fetch state:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    // Poll every 1 minute
    const interval = setInterval(() => fetchState(settings), 60000);
    return () => clearInterval(interval);
  }, [settings]);

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-[#D4AF37]/30 font-sans p-4 md:p-8">
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={handleSaveSettings}
        currentSettings={settings}
      />

      {/* Header */}
      <header className="max-w-[1600px] mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-gradient-to-br from-[#D4AF37] to-amber-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <Activity className="text-black" size={24} strokeWidth={2.5}/>
             </div>
             <h1 className="text-2xl font-semibold tracking-tight">XAU/USD <span className="font-light text-gray-400">Terminal</span></h1>
          </div>
          <p className="text-gray-500 text-sm mt-1 ml-13 hidden sm:block">Real-time Spot Gold Analytics & AI Inference Engine</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#121212] border border-gray-800 p-2 rounded-xl">
           <div className="flex items-center gap-2 px-3 py-1">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
             <span className="text-xs font-mono text-gray-400 tracking-wider">SYSTEM ONLINE</span>
           </div>
           <div className="h-6 w-px bg-gray-800" />
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className="px-3 py-1.5 flex items-center gap-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors text-sm font-medium focus:outline-none"
             title="Back Office configuration"
           >
             <Settings size={16} />
             Settings
           </button>
           <button 
             onClick={() => fetchState(settings)} 
             disabled={loading}
             className="px-4 py-1.5 flex items-center gap-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg transition-colors text-sm font-medium focus:outline-none disabled:opacity-50"
           >
             <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
             Sync AI
           </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left/Center Column: Chart & Gauge */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="h-[500px] w-full relative">
             {/* Chart Header Overlay for branding */}
             <div className="absolute top-4 left-4 z-10 hidden sm:flex items-center gap-2 bg-[#121212]/80 backdrop-blur border border-white/5 px-3 py-1.5 rounded-lg pointer-events-none">
                <Zap size={14} className="text-emerald-400" />
                <span className="text-xs font-mono text-gray-300">Live Advanced Spot</span>
             </div>
             <TradingViewWidget symbol={settings.symbol} />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TechnicalGauge taData={data?.ta} />
              
               {/* Quick Stats Panel (derived from TA) */}
              <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center">
                 <h3 className="text-sm text-gray-400 font-medium mb-4 uppercase tracking-wider">Market Data</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-gray-800 pb-3">
                       <span className="text-gray-500 text-sm">Spot Price</span>
                       <div className="text-right">
                         <span className="text-3xl font-mono text-white tracking-tighter">
                           ${data?.ta?.currentPrice || "----.--"}
                         </span>
                         <span className="ml-3 text-sm font-bold text-emerald-400">
                           {data?.ta?.changePercentage ? `+${data.ta.changePercentage}%` : ""}
                         </span>
                       </div>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500 text-sm">24h High</span>
                      <span className="font-mono text-gray-300">${data?.ta?.high24h || "---"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500 text-sm">24h Low</span>
                      <span className="font-mono text-gray-300">${data?.ta?.low24h || "---"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500 text-sm">Live Spread</span>
                      <span className="font-mono text-yellow-500">{data?.ta?.spread || "---"} pts</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: AI Prediction & News */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <PredictionPanel analysis={data?.analysis} />
           <div className="flex-1 min-h-[400px]">
             <NewsFeed classifiedNews={data?.analysis?.classifiedNews} />
           </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="max-w-[1600px] mx-auto mt-12 mb-4 text-center text-xs text-gray-600 font-mono">
        &copy; {new Date().getFullYear()} XAU/USD Terminal. Simulated environment for demonstrational purposes.
      </footer>
    </div>
  );
}
