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
  factors: { name: string; value: string; impact: number; trend: "up" | "down" | "neutral" }[];
  accuracy: { "1h": number; "6h": number; "24h": number };
  lastUpdate: string;
}

const dirColor = (d: string) => d === "BULLISH" ? "text-[#00ff88]" : d === "BEARISH" ? "text-[#ff4757]" : "text-[#8892a6]";
const riskColor = (r: string) => r === "LOW" ? "text-[#00ff88]" : r === "MEDIUM" ? "text-[#ffa502]" : "text-[#ff4757]";
const actionBg = (a: string) => a === "BUY" ? "bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/40" : a === "SELL" ? "bg-[#ff4757]/20 text-[#ff4757] border-[#ff4757]/40" : "bg-[#1e2a47] text-[#8892a6] border-[#1e2a47]";

export function AIPredictionsPro() {
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  const fetchData = async () => {
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prediction-multi`);
      if (r.ok) setData(await r.json());
    } catch {}
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="pro-card p-5 flex items-center justify-center h-64">
      <div className="text-[#00d4ff] font-mono">Loading AI predictions...</div>
    </div>
  );

  if (!data) return (
    <div className="pro-card p-5 flex items-center justify-center h-64">
      <div className="text-[#8892a6] font-mono">No prediction data</div>
    </div>
  );

  return (
    <div className="pro-card p-5">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#1e2a47]">
        <div>
          <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">AI Market Intelligence</h2>
          <p className="text-sm text-[#8892a6] font-mono mt-1">Real-time predictions (1H/6H/24H) based on on-chain data</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-sm font-mono text-[#00ff88] font-bold">LIVE</span>
        </div>
      </div>

      {/* Timeframe cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {data.predictions.map((pred, idx) => (
          <motion.div key={pred.timeframe} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }} className="pro-card-hover p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#8892a6] font-mono uppercase tracking-wider">{pred.timeframe}</span>
              <span className={`text-sm font-mono font-bold px-2 py-1 rounded-sm border ${actionBg(pred.action)}`}>{pred.action}</span>
            </div>
            <div className={`text-4xl font-mono font-bold mb-2 tabular-nums ${dirColor(pred.direction)}`}>{pred.direction}</div>
            <div className="text-sm font-mono text-white mb-3">{pred.priceTarget}</div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#8892a6] font-mono uppercase">Confidence</span>
              <span className="text-3xl font-mono font-bold tabular-nums text-[#00d4ff]">{pred.confidence}%</span>
            </div>
            <div className="h-2 bg-[#1e2a47] rounded-full overflow-hidden mb-3">
              <motion.div className="h-full bg-[#00d4ff]" initial={{ width: 0 }}
                animate={{ width: `${pred.confidence}%` }} transition={{ duration: 0.8, delay: idx * 0.1 }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8892a6] font-mono uppercase">Risk</span>
              <span className={`text-sm font-mono font-bold ${riskColor(pred.risk)}`}>{pred.risk}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Key Factors */}
      <div className="mb-5">
        <h3 className="text-sm font-mono font-bold text-[#8892a6] uppercase tracking-wider mb-3">Key Factors</h3>
        <div className="space-y-2">
          {data.factors.map((f, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[#1e2a47]/50">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className={`text-sm flex-shrink-0 ${f.trend === "up" ? "text-[#00ff88]" : f.trend === "down" ? "text-[#ff4757]" : "text-[#8892a6]"}`}>
                  {f.trend === "up" ? "▲" : f.trend === "down" ? "▼" : "●"}
                </span>
                <span className="text-sm font-mono text-white truncate">{f.name}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-mono text-[#00d4ff]">{f.value}</span>
                <div className="w-16 h-1.5 bg-[#1e2a47] rounded-full overflow-hidden hidden sm:block">
                  <div className={`h-full ${f.impact > 70 ? "bg-[#00ff88]" : f.impact > 40 ? "bg-[#ffa502]" : "bg-[#8892a6]"}`} style={{ width: `${f.impact}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Accuracy */}
      <div className="pt-4 border-t border-[#1e2a47]">
        <h3 className="text-sm font-mono font-bold text-[#8892a6] uppercase tracking-wider mb-3">Historical Accuracy</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(data.accuracy).map(([tf, acc]) => (
            <div key={tf} className="pro-card p-4 text-center">
              <div className="text-xs text-[#8892a6] font-mono uppercase mb-2">{tf}</div>
              <div className={`text-3xl font-mono font-bold tabular-nums ${acc >= 70 ? "text-[#00ff88]" : acc >= 50 ? "text-[#ffa502]" : "text-[#ff4757]"}`}>{acc}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
