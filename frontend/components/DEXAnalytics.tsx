"use client";

import { useState, useEffect } from "react";
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
  value_mnt: number;
  value_usd: number;
  block: number;
  timestamp: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const fmtUSD = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
};

const dexBadgeColor = (dex: string) => {
  if (dex.includes("FusionX")) return { bg: "bg-[#00d4ff]/20", text: "text-[#00d4ff]", border: "border-[#00d4ff]/40" };
  if (dex.includes("Merchant")) return { bg: "bg-[#a855f7]/20", text: "text-[#a855f7]", border: "border-[#a855f7]/40" };
  return { bg: "bg-[#ffa502]/20", text: "text-[#ffa502]", border: "border-[#ffa502]/40" };
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
      if (swapRes.ok) { const d = await swapRes.json(); setSwaps(d.swaps || []); }
    } catch (e) {
      console.error("DEX fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pro-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#1e2a47]">
        <div>
          <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">DEX Analytics</h2>
          <p className="text-sm text-[#8892a6] font-mono mt-1">FusionX · Merchant Moe · Agni Finance — Mantle Mainnet</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-sm font-mono text-[#00ff88] font-bold">LIVE</span>
        </div>
      </div>

      {/* Summary — 4 horizontal cards like Executive Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className="pro-card p-4 border-[#00d4ff]/20" style={{background:"linear-gradient(135deg,rgba(0,212,255,0.06),transparent)"}}>
          <div className="text-xs text-[#8892a6] font-mono uppercase mb-1">24h Volume</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-[#00d4ff]">
            {summary ? `$${fmtUSD(summary.total_volume_24h)}` : "—"}
          </div>
          <div className="text-xs text-[#00d4ff] font-mono mt-0.5">FusionX + Moe</div>
        </div>
        <div className="pro-card p-4 border-[#00ff88]/20" style={{background:"linear-gradient(135deg,rgba(0,255,136,0.06),transparent)"}}>
          <div className="text-xs text-[#8892a6] font-mono uppercase mb-1">Total TVL</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-[#00ff88]">
            {summary ? `$${fmtUSD(summary.total_tvl)}` : "—"}
          </div>
          <div className="text-xs text-[#00ff88] font-mono mt-0.5">liquidity locked</div>
        </div>
        <div className="pro-card p-4 border-[#ffa502]/20" style={{background:"linear-gradient(135deg,rgba(255,165,2,0.06),transparent)"}}>
          <div className="text-xs text-[#8892a6] font-mono uppercase mb-1">24h Transactions</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-[#ffa502]">
            {summary ? summary.total_transactions_24h.toLocaleString() : "—"}
          </div>
          <div className="text-xs text-[#ffa502] font-mono mt-0.5">swaps &amp; trades</div>
        </div>
        <div className="pro-card p-4 border-[#a855f7]/20" style={{background:"linear-gradient(135deg,rgba(168,85,247,0.06),transparent)"}}>
          <div className="text-xs text-[#8892a6] font-mono uppercase mb-1">Active Pairs</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-[#a855f7]">
            {summary?.top_pairs?.length ?? "—"}
          </div>
          <div className="text-xs text-[#a855f7] font-mono mt-0.5">tracked pools</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(["pairs", "swaps"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-mono rounded-sm transition-colors ${
              tab === t ? "bg-[#00d4ff] text-[#0a0e27] font-bold" : "bg-[#1e2a47] text-[#8892a6] hover:bg-[#2a3f5f]"
            }`}>
            {t === "pairs" ? "Top Pairs" : `Large Swaps (${swaps.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#00d4ff] font-mono">Loading DEX data...</div>
        </div>
      ) : tab === "pairs" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
          {(summary?.top_pairs || []).length === 0 ? (
            <div className="col-span-full text-center py-8 text-[#8892a6] font-mono">No DEX data available</div>
          ) : (
            (summary?.top_pairs || []).map((pair: DEXPair, i: number) => {
              const badge = dexBadgeColor(pair.dex);
              return (
                <div key={i} className="pro-card p-4 hover:border-[#00d4ff]/30 transition-colors">
                  {/* DEX badge + rank */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono font-bold text-[#8892a6]">#{i+1}</span>
                    <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-sm border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {pair.dex.split(" ")[0]}
                    </span>
                  </div>
                  {/* Pair name — big */}
                  <div className="text-base font-mono font-bold text-white mb-1">{pair.pair}</div>
                  <a href={`https://mantlescan.xyz/address/${pair.pool_address}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-mono text-[#8892a6] hover:text-[#00d4ff] block mb-3">
                    {pair.pool_address.slice(0,8)}...
                  </a>
                  {/* Volume — big number */}
                  <div className="text-2xl font-mono font-bold tabular-nums text-[#00d4ff] mb-0.5">
                    ${fmtUSD(pair.volume_24h)}
                  </div>
                  <div className="text-xs font-mono text-[#8892a6] mb-3">24h volume</div>
                  {/* TVL + Txs */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="text-[#8892a6]">TVL</div>
                      <div className="text-[#00ff88] font-bold">${fmtUSD(pair.tvl)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#8892a6]">Txs</div>
                      <div className="text-[#ffa502] font-bold">{pair.tx_count.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {swaps.length === 0 ? (
            <div className="text-center py-8 text-[#8892a6] font-mono">No large swaps detected</div>
          ) : (
            swaps.map((swap, i) => (
              <div key={i} className="pro-card-hover p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-[#00ff88]/20 border border-[#00ff88]/40 rounded-sm flex items-center justify-center flex-shrink-0">
                  <span className="text-[#00ff88] font-mono font-bold text-sm">↑</span>
                </div>
                <div className="flex-1 min-w-0">
                  <a href={`https://mantlescan.xyz/tx/${swap.tx_hash}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-sm font-mono text-[#00d4ff] hover:text-[#00b8e6]">
                    {swap.tx_hash.slice(0, 14)}...
                  </a>
                  <div className="text-xs text-[#8892a6] font-mono mt-0.5">
                    From: {swap.from.slice(0, 8)}...{swap.from.slice(-4)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-mono font-bold text-[#00ff88] tabular-nums">{fmtUSD(swap.value_usd)}</div>
                  <div className="text-xs text-[#8892a6] font-mono">
                    {formatDistanceToNow(new Date(swap.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
