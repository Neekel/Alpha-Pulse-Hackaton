"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface DEXPair {
  dex: string;
  pair: string;
  volume_24h: number;
  fees_24h: number;
  tx_count: number;
  tvl: number;
  pool_address: string;
}

interface LargeSwap {
  tx_hash: string;
  from: string;
  to: string;
  value_mnt: number;
  value_usd: number;
  block: number;
  timestamp: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const fmt = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
};

export function DEXAnalytics() {
  const [summary, setSummary] = useState<any>(null);
  const [swaps, setSwaps] = useState<LargeSwap[]>([]);
  const [tab, setTab] = useState<"pairs" | "swaps">("pairs");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 30_000);
    return () => clearInterval(iv);
  }, []);

  const fetchAll = async () => {
    try {
      const [sumRes, swapRes] = await Promise.all([
        fetch(`${API_URL}/api/dex/summary`),
        fetch(`${API_URL}/api/dex/large-swaps?min_usd=10000`),
      ]);
      if (sumRes.ok) setSummary(await sumRes.json());
      if (swapRes.ok) {
        const d = await swapRes.json();
        setSwaps(d.swaps || []);
      }
    } catch (e) {
      console.error("DEX fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const dexColor = (dex: string) => {
    if (dex.includes("FusionX")) return "text-[#00d4ff]";
    if (dex.includes("Merchant")) return "text-[#a855f7]";
    if (dex.includes("Agni")) return "text-[#ffa502]";
    return "text-[#8892a6]";
  };

  return (
    <div className="pro-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e2a47]">
        <div>
          <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
            DEX Analytics
          </h2>
          <p className="text-xs text-[#8892a6] font-mono mt-1">
            FusionX · Merchant Moe · Agni Finance — Mantle Mainnet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-xs font-mono text-[#00ff88]">LIVE</span>
        </div>
      </div>

      {/* Summary row */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="pro-card p-4">
            <div className="metric-label mb-1">24h Volume</div>
            <div className="metric-value text-[#00d4ff]">{fmt(summary.total_volume_24h)}</div>
          </div>
          <div className="pro-card p-4">
            <div className="metric-label mb-1">Total TVL</div>
            <div className="metric-value text-[#00ff88]">{fmt(summary.total_tvl)}</div>
          </div>
          <div className="pro-card p-4">
            <div className="metric-label mb-1">24h Transactions</div>
            <div className="metric-value text-[#ffa502]">
              {summary.total_transactions_24h.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(["pairs", "swaps"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-xs font-mono rounded-sm transition-colors ${
              tab === t ? "bg-[#00d4ff] text-[#0a0e27]" : "bg-[#1e2a47] text-[#8892a6] hover:bg-[#2a3f5f]"
            }`}
          >
            {t === "pairs" ? "Top Pairs" : `Large Swaps (${swaps.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#00d4ff] font-mono text-sm">Loading DEX data...</div>
        </div>
      ) : tab === "pairs" ? (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>DEX</th>
                <th>Pair</th>
                <th>24h Volume</th>
                <th>24h Fees</th>
                <th>TVL</th>
                <th>Txs</th>
              </tr>
            </thead>
            <tbody>
              {(summary?.top_pairs || []).map((pair: DEXPair, i: number) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td>
                    <span className={`text-xs font-bold ${dexColor(pair.dex)}`}>
                      {pair.dex}
                    </span>
                  </td>
                  <td className="text-white font-bold">{pair.pair}</td>
                  <td className="text-[#00d4ff] tabular-nums">{fmt(pair.volume_24h)}</td>
                  <td className="text-[#00ff88] tabular-nums">{fmt(pair.fees_24h)}</td>
                  <td className="text-[#ffa502] tabular-nums">{fmt(pair.tvl)}</td>
                  <td className="text-[#8892a6] tabular-nums">{pair.tx_count.toLocaleString()}</td>
                </motion.tr>
              ))}
              {(!summary?.top_pairs || summary.top_pairs.length === 0) && (
                <tr>
                  <td colSpan={6} className="text-center text-[#8892a6] py-8">
                    No DEX data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tx Hash</th>
                <th>From</th>
                <th>Value MNT</th>
                <th>Value USD</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {swaps.map((swap, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <td>
                    <a
                      href={`https://mantlescan.xyz/tx/${swap.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00d4ff] hover:text-[#00b8e6] font-mono text-xs"
                    >
                      {swap.tx_hash.slice(0, 10)}...
                    </a>
                  </td>
                  <td>
                    <code className="text-xs text-[#8892a6]">
                      {swap.from.slice(0, 8)}...{swap.from.slice(-4)}
                    </code>
                  </td>
                  <td className="text-white tabular-nums">{swap.value_mnt.toLocaleString()}</td>
                  <td className="text-[#00ff88] tabular-nums font-bold">{fmt(swap.value_usd)}</td>
                  <td className="text-[#8892a6] text-xs">
                    {formatDistanceToNow(new Date(swap.timestamp), { addSuffix: true })}
                  </td>
                </motion.tr>
              ))}
              {swaps.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-[#8892a6] py-8">
                    No large swaps detected
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
