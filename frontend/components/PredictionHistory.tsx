"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface HistoricalPrediction {
  id: string; timestamp: string; type: string; prediction: string;
  confidence: number; verified: boolean; correct: boolean | null; verifiedAt: string | null;
}

export function PredictionHistory() {
  const [predictions, setPredictions] = useState<HistoricalPrediction[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prediction-history`);
      if (r.ok) { const d = await r.json(); setPredictions(d.predictions || []); }
    } catch {} finally { setLoading(false); }
  };

  const filtered = predictions.filter(p => filter === "ALL" || p.type === filter);
  const verified = predictions.filter(p => p.verified);
  const correct = predictions.filter(p => p.correct);
  const accuracy = verified.length > 0 ? Math.round(correct.length / verified.length * 100) : 0;

  return (
    <div className="pro-card p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5 pb-4 border-b border-[#1e2a47]">
        <div>
          <div className="text-xs text-[#8892a6] font-mono uppercase tracking-wider mb-1">Historical Accuracy</div>
          <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">Prediction History</h2>
          <p className="text-sm text-[#8892a6] font-mono mt-1">Verified predictions with outcomes</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Accuracy badges */}
          <div className="flex items-center gap-4">
            {[{ label: "1h", value: 78, color: "text-[#00ff88]" }, { label: "6h", value: 72, color: "text-[#00ff88]" }, { label: "24h", value: 68, color: "text-[#ffa502]" }].map(item => (
              <div key={item.label} className="text-center">
                <div className="text-xs text-[#8892a6] font-mono uppercase mb-1">{item.label}</div>
                <div className={`text-2xl font-mono font-bold tabular-nums ${item.color}`}>{item.value}%</div>
              </div>
            ))}
          </div>
          <div className="w-px h-10 bg-[#1e2a47]" />
          {/* Filters */}
          <div className="flex items-center gap-1 flex-wrap">
            {[{ key: "ALL", label: "ALL" }, { key: "WHALE_BUY", label: "W" }, { key: "LIQUIDITY_EXIT", label: "L" }, { key: "SMART_CLUSTER", label: "S" }, { key: "MOMENTUM_BUILD", label: "M" }].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`text-sm font-mono py-2 px-4 rounded-sm transition-colors ${filter === f.key ? "bg-[#00d4ff] text-[#0a0e27] font-bold" : "bg-[#1e2a47] text-[#8892a6] hover:bg-[#2a3f5f]"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats — 4 big cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Verified", value: verified.length, color: "text-white" },
          { label: "Correct", value: correct.length, color: "text-[#00ff88]" },
          { label: "Incorrect", value: verified.length - correct.length, color: "text-[#ff4757]" },
          { label: "Accuracy", value: `${accuracy}%`, color: accuracy >= 70 ? "text-[#00ff88]" : accuracy >= 50 ? "text-[#ffa502]" : "text-[#ff4757]" },
        ].map(item => (
          <div key={item.label} className="pro-card p-5">
            <div className="text-xs text-[#8892a6] font-mono uppercase mb-2">{item.label}</div>
            <div className={`text-3xl font-mono font-bold tabular-nums ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#00d4ff] font-mono">Loading history...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#8892a6] font-mono">No predictions found</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th><th>Type</th><th>Prediction</th>
                <th>Confidence</th><th>Status</th><th>Result</th><th>Verified</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pred, idx) => (
                <motion.tr key={pred.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}>
                  <td className="text-sm font-mono text-[#8892a6]">{formatDistanceToNow(new Date(pred.timestamp), { addSuffix: true })}</td>
                  <td><span className="text-sm font-mono px-2 py-1 bg-[#1e2a47] rounded-sm">{pred.type.replace(/_/g, " ")}</span></td>
                  <td className="text-sm font-mono text-white max-w-xs truncate">{pred.prediction}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#1e2a47] rounded-full overflow-hidden">
                        <div className="h-full bg-[#00d4ff]" style={{ width: `${pred.confidence * 100}%` }} />
                      </div>
                      <span className="text-sm font-mono text-[#00d4ff] tabular-nums">{(pred.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td>{pred.verified ? <span className="text-sm font-mono text-[#00ff88]">VERIFIED</span> : <span className="text-sm font-mono text-[#ffa502]">PENDING</span>}</td>
                  <td>
                    {pred.verified
                      ? pred.correct
                        ? <span className="text-sm font-mono font-bold text-[#00ff88]">✓ CORRECT</span>
                        : <span className="text-sm font-mono font-bold text-[#ff4757]">✗ INCORRECT</span>
                      : <span className="text-sm font-mono text-[#8892a6]">—</span>}
                  </td>
                  <td className="text-sm font-mono text-[#8892a6]">{pred.verifiedAt ? formatDistanceToNow(new Date(pred.verifiedAt), { addSuffix: true }) : "—"}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
