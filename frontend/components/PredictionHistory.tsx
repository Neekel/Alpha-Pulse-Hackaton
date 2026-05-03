"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface HistoricalPrediction {
  id: string;
  timestamp: string;
  type: string;
  prediction: string;
  confidence: number;
  verified: boolean;
  correct: boolean | null;
  verifiedAt: string | null;
}

export function PredictionHistory() {
  const [predictions, setPredictions] = useState<HistoricalPrediction[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/prediction-history`
      );
      if (response.ok) {
        const data = await response.json();
        setPredictions(data.predictions || []);
      }
    } catch (error) {
      console.error("Failed to fetch prediction history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPredictions = predictions.filter(p => 
    filter === "ALL" || p.type === filter
  );

  const stats = {
    total: predictions.filter(p => p.verified).length,
    correct: predictions.filter(p => p.correct).length,
    accuracy: predictions.filter(p => p.verified).length > 0
      ? Math.round((predictions.filter(p => p.correct).length / predictions.filter(p => p.verified).length) * 100)
      : 0
  };

  return (
    <div className="pro-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e2a47]">
        <div>
          <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
            Prediction History
          </h2>
          <p className="text-xs text-[#8892a6] font-mono mt-1">
            Verified predictions • {stats.accuracy}% accuracy rate
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {["ALL", "WHALE_BUY", "LIQUIDITY_EXIT", "SMART_CLUSTER", "MOMENTUM_BUILD"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-mono rounded-sm transition-colors ${
                filter === f
                  ? "bg-[#00d4ff] text-[#0a0e27]"
                  : "bg-[#1e2a47] text-[#8892a6] hover:bg-[#2a3f5f]"
              }`}
            >
              {f === "ALL" ? "ALL" : f.charAt(0)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="pro-card p-4">
          <div className="metric-label mb-2">Total Verified</div>
          <div className="metric-value text-white">{stats.total}</div>
        </div>
        <div className="pro-card p-4">
          <div className="metric-label mb-2">Correct</div>
          <div className="metric-value text-[#00ff88]">{stats.correct}</div>
        </div>
        <div className="pro-card p-4">
          <div className="metric-label mb-2">Incorrect</div>
          <div className="metric-value text-[#ff4757]">{stats.total - stats.correct}</div>
        </div>
        <div className="pro-card p-4">
          <div className="metric-label mb-2">Accuracy</div>
          <div className={`metric-value ${
            stats.accuracy >= 70 ? "text-[#00ff88]" :
            stats.accuracy >= 50 ? "text-[#ffa502]" :
            "text-[#ff4757]"
          }`}>
            {stats.accuracy}%
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#00d4ff] font-mono">Loading history...</div>
        </div>
      ) : filteredPredictions.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#8892a6] font-mono text-sm">No predictions found</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Prediction</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Result</th>
                <th>Verified</th>
              </tr>
            </thead>
            <tbody>
              {filteredPredictions.map((pred, idx) => (
                <motion.tr
                  key={pred.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <td className="text-[#8892a6]">
                    {formatDistanceToNow(new Date(pred.timestamp), { addSuffix: true })}
                  </td>
                  <td>
                    <span className="px-2 py-1 bg-[#1e2a47] rounded-sm text-xs">
                      {pred.type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="text-white max-w-xs truncate">{pred.prediction}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-[#1e2a47] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00d4ff]"
                          style={{ width: `${pred.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-[#00d4ff] tabular-nums">
                        {(pred.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    {pred.verified ? (
                      <span className="text-[#00ff88]">VERIFIED</span>
                    ) : (
                      <span className="text-[#ffa502]">PENDING</span>
                    )}
                  </td>
                  <td>
                    {pred.verified ? (
                      pred.correct ? (
                        <span className="text-[#00ff88] font-bold">✓ CORRECT</span>
                      ) : (
                        <span className="text-[#ff4757] font-bold">✗ INCORRECT</span>
                      )
                    ) : (
                      <span className="text-[#8892a6]">—</span>
                    )}
                  </td>
                  <td className="text-[#8892a6]">
                    {pred.verifiedAt
                      ? formatDistanceToNow(new Date(pred.verifiedAt), { addSuffix: true })
                      : "—"}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
