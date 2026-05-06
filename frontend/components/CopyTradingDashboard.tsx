"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface Trader {
  rank: number; address: string; profit: number; profit_pct: number;
  win_rate: number; trades: number; total_volume: number;
  strategy: string; followers: number; last_trade: string;
}

const stratColor = (s: string) => ({
  "Whale Follower": "text-[#00d4ff]",
  "Smart Money": "text-[#00ff88]",
  "Liquidity Hunter": "text-[#ffa502]",
}[s] ?? "text-[#8892a6]");

const stratBg = (s: string) => ({
  "Whale Follower": "bg-[#00d4ff]/10 border-[#00d4ff]/30",
  "Smart Money": "bg-[#00ff88]/10 border-[#00ff88]/30",
  "Liquidity Hunter": "bg-[#ffa502]/10 border-[#ffa502]/30",
}[s] ?? "bg-[#1e2a47] border-[#2a3f5f]");

export function CopyTradingDashboard() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, []);

  const load = async () => {
    try {
      const r = await fetch(`${API_URL}/api/copy-trading/top-traders?limit=10`);
      if (r.ok) { const d = await r.json(); setTraders(d.traders || []); }
    } catch {} finally { setLoading(false); }
  };

  const loadDetails = async (addr: string) => {
    try {
      const r = await fetch(`${API_URL}/api/copy-trading/trader/${addr}`);
      if (r.ok) setDetails(await r.json());
    } catch {}
  };

  const handleClick = (addr: string) => {
    if (selected === addr) { setSelected(null); setDetails(null); return; }
    setSelected(addr); loadDetails(addr);
  };

  // Summary stats from traders
  const totalVolume = traders.reduce((s, t) => s + t.total_volume, 0);
  const avgWinRate = traders.length ? traders.reduce((s, t) => s + t.win_rate, 0) / traders.length : 0;
  const topProfit = traders[0]?.profit ?? 0;

  if (loading) return (
    <div className="pro-card p-5 flex items-center justify-center h-32">
      <div className="text-[#00d4ff] font-mono">Loading traders...</div>
    </div>
  );

  return (
    <div className="pro-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#1e2a47]">
        <div>
          <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">Copy Trading Leaderboard</h2>
          <p className="text-sm text-[#8892a6] font-mono mt-1">Track top traders → Copy their winning strategies</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-sm font-mono text-[#00ff88] font-bold">LIVE</span>
        </div>
      </div>

      {/* Stats — 4 horizontal cards like Executive Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className="pro-card p-4 border-[#00ff88]/20" style={{background:"linear-gradient(135deg,rgba(0,255,136,0.06),transparent)"}}>
          <div className="text-xs text-[#8892a6] font-mono uppercase mb-1">Top Profit</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-[#00ff88]">${(topProfit/1000).toFixed(1)}K</div>
          <div className="text-xs text-[#00ff88] font-mono mt-0.5">↗ #{traders[0]?.rank ?? 1} trader</div>
        </div>
        <div className="pro-card p-4 border-[#00d4ff]/20" style={{background:"linear-gradient(135deg,rgba(0,212,255,0.06),transparent)"}}>
          <div className="text-xs text-[#8892a6] font-mono uppercase mb-1">Avg Win Rate</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-[#00d4ff]">{avgWinRate.toFixed(0)}%</div>
          <div className="text-xs text-[#00d4ff] font-mono mt-0.5">across {traders.length} traders</div>
        </div>
        <div className="pro-card p-4 border-[#ffa502]/20" style={{background:"linear-gradient(135deg,rgba(255,165,2,0.06),transparent)"}}>
          <div className="text-xs text-[#8892a6] font-mono uppercase mb-1">Total Volume</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-[#ffa502]">${(totalVolume/1e6).toFixed(1)}M</div>
          <div className="text-xs text-[#ffa502] font-mono mt-0.5">combined</div>
        </div>
        <div className="pro-card p-4 border-[#a855f7]/20" style={{background:"linear-gradient(135deg,rgba(168,85,247,0.06),transparent)"}}>
          <div className="text-xs text-[#8892a6] font-mono uppercase mb-1">Strategies</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-[#a855f7]">{new Set(traders.map(t=>t.strategy)).size}</div>
          <div className="text-xs text-[#a855f7] font-mono mt-0.5">unique types</div>
        </div>
      </div>

      {/* Traders list */}
      <div className="space-y-1.5 mb-4">
        {traders.map((t, idx) => (
          <motion.div key={t.address} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }} onClick={() => handleClick(t.address)}
            className={`px-4 py-2.5 cursor-pointer rounded-sm border transition-colors ${
              selected === t.address
                ? "bg-[#00d4ff]/10 border-[#00d4ff]/40"
                : "bg-[#141b2d] border-[#1e2a47] hover:border-[#2a3f5f]"
            }`}>
            <div className="flex items-center gap-3">
              {/* Rank */}
              <div className="w-8 text-center flex-shrink-0">
                {t.rank <= 3
                  ? <span className="text-base">{["🥇","🥈","🥉"][t.rank-1]}</span>
                  : <span className="text-sm font-mono font-bold text-[#8892a6]">#{t.rank}</span>}
              </div>

              {/* Address */}
              <code className="text-sm font-mono text-[#00d4ff] flex-shrink-0 hidden sm:block">
                {t.address.slice(0,6)}...{t.address.slice(-4)}
              </code>

              {/* Strategy badge */}
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-sm border flex-shrink-0 ${stratBg(t.strategy)} ${stratColor(t.strategy)}`}>
                {t.strategy}
              </span>

              {/* Stats inline */}
              <div className="flex-1 flex items-center gap-4 min-w-0 text-xs font-mono text-[#8892a6]">
                <span className="hidden md:inline">{t.trades} trades</span>
                <span className="hidden lg:inline">${(t.total_volume/1e6).toFixed(1)}M</span>
                <span className="hidden md:inline">{t.followers} followers</span>
              </div>

              {/* Win rate bar */}
              <div className="flex items-center gap-1.5 flex-shrink-0 hidden sm:flex w-24">
                <div className="flex-1 h-1 bg-[#1e2a47] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00ff88]" style={{ width: `${t.win_rate}%` }} />
                </div>
                <span className="text-xs font-mono text-[#00ff88] tabular-nums">{t.win_rate.toFixed(0)}%</span>
              </div>

              {/* Profit */}
              <div className="text-right flex-shrink-0">
                <span className="text-base font-mono font-bold tabular-nums text-[#00ff88]">${(t.profit/1000).toFixed(1)}K</span>
                <span className="text-xs font-mono text-[#00ff88] ml-1">+{t.profit_pct.toFixed(0)}%</span>
              </div>

              <button className="pro-btn text-xs py-1 px-2.5 flex-shrink-0">
                {selected === t.address ? "▲" : "▼"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trader details — inline expand */}
      {selected && details && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="pro-card p-5 bg-[#1e2a47]/30 border border-[#00d4ff]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-[#8892a6] font-mono uppercase mb-1">Trader Analysis</div>
              <code className="text-sm font-mono text-[#00d4ff]">{details.address}</code>
            </div>
            <button onClick={() => { setSelected(null); setDetails(null); }}
              className="text-sm font-mono py-1.5 px-3 text-[#8892a6] hover:text-white pro-btn">✕ Close</button>
          </div>

          {details.strategy_analysis?.status === "success" && (
            <div className="p-4 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-sm mb-4">
              <div className="text-xs text-[#8892a6] font-mono uppercase mb-2">AI Strategy Analysis</div>
              <p className="text-sm font-mono text-white leading-relaxed">{details.strategy_analysis.analysis}</p>
            </div>
          )}

          {details.trades?.length > 0 && (
            <div>
              <div className="text-xs text-[#8892a6] font-mono uppercase mb-2">Recent Trades</div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {details.trades.slice(0, 5).map((trade: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#141b2d] rounded-sm">
                    <div>
                      <span className="text-sm font-mono text-white">{trade.type?.replace(/_/g, " ")}</span>
                      <span className="text-xs text-[#8892a6] font-mono ml-2">{trade.protocol} · ${(trade.amount/1000).toFixed(1)}K</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-mono font-bold ${trade.pnl > 0 ? "text-[#00ff88]" : "text-[#ff4757]"}`}>
                        {trade.pnl > 0 ? "+" : ""}{trade.pnl_pct?.toFixed(1)}%
                      </span>
                      <span className="text-xs text-[#8892a6] font-mono ml-2">
                        {formatDistanceToNow(new Date(trade.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="w-full pro-btn-primary text-sm font-mono py-2.5 mt-4">
            Copy This Trader (Coming Soon)
          </button>
        </motion.div>
      )}
    </div>
  );
}
