// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ symbol = "OANDA:XAUUSD" }: { symbol?: string }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    // Clean up existing children if any
    container.current.innerHTML = '';
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${symbol}",
        "interval": "15",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "backgroundColor": "rgba(18, 18, 18, 1)",
        "gridColor": "rgba(42, 46, 57, 0.4)",
        "hide_top_toolbar": false,
        "hide_legend": false,
        "save_image": false,
        "container_id": "tradingview_xauusd",
        "support_host": "https://www.tradingview.com"
      }`;
    container.current.appendChild(script);

    return () => {
        if(container.current) {
            container.current.innerHTML = '';
        }
    };
  }, []);

  return (
    <div className="tradingview-widget-container h-full w-full rounded-2xl overflow-hidden border border-gray-800 shadow-xl bg-[#121212]">
      <div id="tradingview_xauusd" ref={container} className="h-full w-full" />
    </div>
  );
}

export default memo(TradingViewWidget);
