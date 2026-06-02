import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { XMLParser } from "fast-xml-parser";

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const parser = new XMLParser();

app.use(express.json());

// Fallback Mock News
const mockNews = [
  { title: "Fed signals potential rate cuts later this year as inflation cools.", source: "Financial Times", time: new Date().toISOString() },
  { title: "Gold prices hit new historic high amid geopolitical tensions in the Middle East.", source: "Reuters", time: new Date(Date.now() - 15 * 60000).toISOString() },
  { title: "US Dollar Index (DXY) drops significantly following weak manufacturing data.", source: "Bloomberg", time: new Date(Date.now() - 45 * 60000).toISOString() },
  { title: "Central banks reportedly buy record amounts of gold for reserves.", source: "ForexLive", time: new Date(Date.now() - 120 * 60000).toISOString() },
];

let lastNewsAndPrediction: any = null;
let cachedPredictionTime = 0;

// Fake Technical Analysis Data for the Gauge
function generateMockTA() {
  const rsi = 40 + Math.random() * 40; // 40 to 80
  const macd = Math.random() * 2 - 1; 
  const currentPrice = 2415.50 + (Math.random() * 10 - 5);
  
  let bias = "Neutral";
  if (rsi > 70 && macd > 0.5) bias = "Strong Buy";
  else if (rsi > 60) bias = "Buy";
  else if (rsi < 30 && macd < -0.5) bias = "Strong Sell";
  else if (rsi < 40) bias = "Sell";

  return {
    currentPrice: currentPrice.toFixed(2),
    high24h: (currentPrice + 12.5).toFixed(2),
    low24h: (currentPrice - 8.2).toFixed(2),
    changePercentage: ((currentPrice - 2415.50) / 2415.50 * 100).toFixed(2),
    spread: (0.3 + Math.random() * 0.2).toFixed(2),
    indicators: {
      rsi: rsi.toFixed(2),
      macd: macd.toFixed(2),
      ema20: (currentPrice - 2).toFixed(2),
      ema50: (currentPrice - 5).toFixed(2),
      ema200: (currentPrice - 15).toFixed(2),
    },
    gaugeBias: bias
  };
}

async function fetchRealNews() {
  try {
    const response = await fetch('https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664');
    if (!response.ok) throw new Error("Failed to fetch RSS");
    const xmlData = await response.text();
    const result = parser.parse(xmlData);
    const items = result.rss.channel.item.slice(0, 5);
    return items.map((item: any) => ({
      title: item.title,
      source: "CNBC",
      time: new Date(item.pubDate).toISOString()
    }));
  } catch (err) {
    console.error("RSS fetch failed, using fallback:", err);
    return mockNews;
  }
}

async function analyzeWithGemini(news: any[], taRef: string, customApiKey?: string) {
  try {
    const prompt = `
      You are an expert financial AI engineer analyzing Gold Spot (XAU/USD).
      Based on the following recent news headlines and current Technical Analysis summary, provide:
      1. A sentiment analysis score for the news (0-100, where 100 is extremely Bullish for Gold, 0 is extremely Bearish).
      2. A classification of each news item as "Bullish", "Bearish", or "Neutral".
      3. A "Next 30-Min Trend Prediction" (Up, Down, or Sideways).
      4. A Confidence Score (0-100%) for the prediction.
      5. 3 specific bullet points of reasoning.

      Technical Analysis Bias: ${taRef}
      News:
      ${news.map((n: any) => `- ${n.title}`).join('\n')}

      Return ONLY valid JSON in this exact structure:
      {
        "marketSentimentScore": 75,
        "sentimentBreakdown": { "bullish": 60, "bearish": 20, "neutral": 20 },
        "classifiedNews": [
          { "title": "Headline here", "sentiment": "Bullish" }
        ],
        "prediction": {
          "trend": "Up",
          "confidence": 85,
          "reasoning": [
            "Reason 1",
            "Reason 2",
            "Reason 3"
          ]
        }
      }
    `;

    const aiClient = customApiKey ? new GoogleGenAI({ apiKey: customApiKey }) : ai;

    const response = await aiClient.models.generateContent({
      model: 'models/gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text() || '{}');
    return parsed;
  } catch (e) {
    console.error("Gemini analysis failed:", e);
    return {
      marketSentimentScore: 65,
      sentimentBreakdown: { bullish: 65, bearish: 25, neutral: 10 },
      classifiedNews: news.map(n => ({ title: n.title, sentiment: "Bullish" })),
      prediction: {
        trend: "Up",
        confidence: 60,
        reasoning: ["RSI showing bullish momentum.", "Geopolitical tensions supporting gold.", "Waiting for further signals."]
      }
    };
  }
}

app.post("/api/state", async (req, res) => {
  const { geminiKey, symbol, interval } = req.body || {};

  const taState = generateMockTA();
  
  const now = Date.now();
  // Cache the prediction for 1 minute to avoid spamming the API and rapid shifting on the UI
  if (!lastNewsAndPrediction || now - cachedPredictionTime > 60 * 1000) {
    const news = await fetchRealNews();
    const predictionData = await analyzeWithGemini(news, taState.gaugeBias, geminiKey);
    
    // Add the source and time back into the classified news
    const finalNews = predictionData.classifiedNews?.map((item: any) => {
      const original = news.find((n: any) => n.title.includes(item.title) || item.title.includes(n.title));
      return {
        ...item,
        source: original?.source || "Market Watch",
        time: original?.time || new Date().toISOString()
      };
    }) || news;
    predictionData.classifiedNews = finalNews;

    lastNewsAndPrediction = predictionData;
    cachedPredictionTime = now;
  }

  res.json({
    ta: taState,
    analysis: lastNewsAndPrediction
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
