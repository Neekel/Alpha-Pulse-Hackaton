"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface TimeframePrediction {
  timeframe: string;
  direction: "BULLISH" | "BEARISH" | "NEUTRAL";
  confidence: number;
  priceTarget: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  action: "BUY" | "SELL" | "HOLD" | "WAIT";
}

interface PredictionData {
  predictions: TimeframePrediction[];
  factors: {
    name: string;
    value: string;
    impact: number;
    trend: "up" | "down" | "neutral";
  }[];
  accuracy: {
    "1h": number;
    "6h": number;
    "24h": number;
  };
  lastUpdate: string;
}

export function AIPredictionsPro() {
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/prediction-multi`
      );
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case "BULLISH":
        return "text-[#00ff88]";
      case "BEARISH":
        return "text-[#ff4757]";
      default:
        return "text-[#8892a6]";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "text-[#00ff88]";
      case "MEDIUM":
        return "text-[#ffa502]";
      case "HIGH":
        return "text-[#ff4757]";
      default:
        return "text-[#8892a6]";
    }
  };

  if (loading) {
    return (
      <div className="pro-card p-6 h-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-[#00d4ff] font-mono">Loading AI predictions...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pro-card p-6 h-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-[#8892a6] font-mono text-sm">No prediction data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pro-card p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e2a47]">
        <div>
          <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
            AI Market Intelligence
          </h2>
          <p className="text-xs text-[#8892a6] font-mono mt-1">
            Multi-timeframe analysis • Updated {new Date(data.lastUpdate).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-xs font-mono text-[#00ff88]">LIVE</span>
        </div>
      </div>

      {/* Timeframe Predictions */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {data.predictions.map((pred, idx) => (
          <motion.div
            key={pred.timeframe}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="pro-card-hover p-4"
          >
            <div className="text-xs font-mono text-[#8892a6] mb-2 uppercase">
              {pred.timeframe}
            </div>
            <div className={`text-xl font-mono font-bold mb-1 ${getDirectionColor(pred.direction)}`}>
              {pred.direction}
            </div>
            <div className="text-sm font-mono text-white mb-2">
              {pred.priceTarget}
            </div>
            <div className="flex items-center justify-between text-xs font-mono mb-3">
              <span className="text-[#8892a6]">Confidence</span>
              <span className="text-[#00d4ff]">{pred.confidence}%</span>
            </div>
            <div className="h-1 bg-[#1e2a47] rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-[#00d4ff]"
                initial={{ width: 0 }}
                animate={{ width: `${pred.confidence}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#8892a6]">Risk</span>
              <span className={getRiskColor(pred.risk)}>{pred.risk}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-[#1e2a47]">
              <div className={`text-center text-sm font-mono font-bold ${
                pred.action === "BUY" ? "text-[#00ff88]" :
                pred.action === "SELL" ? "text-[#ff4757]" :
                "text-[#8892a6]"
              }`}>
                → {pred.action}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Key Factors */}
      <div className="mb-6">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">
          Key Factors
        </h3>
        <div className="space-y-2">
          {data.factors.map((factor, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-[#1e2a47]/50">
              <div className="flex items-center gap-3 flex-1">
                <div className={`text-xs ${
                  factor.trend === "up" ? "text-[#00ff88]" :
                  factor.trend === "down" ? "text-[#ff4757]" :
                  "text-[#8892a6]"
                }`}>
                  {factor.trend === "up" ? "▲" : factor.trend === "down" ? "▼" : "●"}
                </div>
                <span className="text-sm font-mono text-white">{factor.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-mono text-[#00d4ff]">{factor.value}</span>
                <div className="w-16 h-1 bg-[#1e2a47] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      factor.impact > 70 ? "bg-[#00ff88]" :
                      factor.impact > 40 ? "bg-[#ffa502]" :
                      "bg-[#8892a6]"
                    }`}
                    style={{ width: `${factor.impact}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Accuracy */}
      <div className="mt-auto pt-4 border-t border-[#1e2a47]">
        <h3 className="text-xs font-mono font-bold text-[#8892a6] uppercase tracking-wider mb-3">
          Historical Accuracy
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(data.accuracy).map(([timeframe, accuracy]) => (
            <div key={timeframe} className="text-center">
              <div className="text-xs font-mono text-[#8892a6] mb-1">{timeframe}</div>
              <div className={`text-lg font-mono font-bold ${
                accuracy >= 70 ? "text-[#00ff88]" :
                accuracy >= 50 ? "text-[#ffa502]" :
                "text-[#ff4757]"
              }`}>
                {accuracy}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
