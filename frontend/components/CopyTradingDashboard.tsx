"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface Trader {
  rank: number; address: string; profit: number; profit_pct: number;
  win_rate: number; trades: number; total_volume: number;
  strategy: string; followers: number; last_trade: string;
}

const stratColor = (s: string) => ({ "Whale Follower": "text-[#00d4ff]", "Smart Money": "text-[#00ff88]", "Liquidity Hunter": "text-[#ffa502]" }[s] ?? "text-[#8892a6]");

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

  const handleClick = (addr: string) => { setSelected(addr); loadDetails(addr); };

  if (loading) return (
    <div className="pro-card p-5 flex items-center justify-center h-64">
      <div className="text-[#00d4ff] font-mono">Loading traders...</div>
    </div>
  );

  return (
    <div className="pro-card p-5">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#1e2a47]">
        <div>
          <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">Copy Trading Leaderboard</h2>
          <p className="text-sm text-[#8892a6] font-mono mt-1">Track top traders → Copy their winning strategies automatically</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-sm font-mono text-[#00ff88] font-bold">LIVE</span>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        {traders.map((t, idx) => (
          <motion.div key={t.address} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }} onClick={() => handleClick(t.address)}
            className={`pro-card-hover p-5 cursor-pointer ${selected === t.address ? "border border-[#00d4ff]/40" : ""}`}>
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="w-14 text-center flex-shrink-0">
                {t.rank <= 3 ? (
                  <div className="text-3xl">{["🥇","🥈","🥉"][t.rank-1]}</div>
                ) : (
                  <div className="text-3xl font-mono font-bold text-[#8892a6] tabular-nums">#{t.rank}</div>
                )}
              </div>

              {/* Address + strategy + stats */}
              <div className="flex-1 min-w-0">
                <code className="text-sm font-mono text-[#00d4ff] block mb-1">
                  {t.address.slice(0, 6)}...{t.address.slice(-4)}
                </code>
                <span className={`text-sm font-mono font-bold ${stratColor(t.strategy)}`}>{t.strategy}</span>
                <div className="flex items-center gap-5 mt-2">
                  {[
                    { label: "Trades", value: t.trades },
                    { label: "Volume", value: `$${(t.total_volume / 1e6).toFixed(1)}M` },
                    { label: "Followers", value: t.followers },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="text-xs text-[#8892a6] font-mono uppercase">{item.label}</div>
                      <div className="text-sm font-mono text-white tabular-nums">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profit + win rate */}
              <div className="flex-shrink-0 text-right">
                <div className="text-2xl font-mono font-bold tabular-nums text-[#00ff88]">${(t.profit / 1000).toFixed(1)}K</div>
                <div className="text-sm font-mono text-[#00ff88] tabular-nums mb-2">+{t.profit_pct.toFixed(1)}%</div>
                <div className="flex items-center gap-2 justify-end">
                  <div className="w-20 h-1.5 bg-[#1e2a47] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00ff88]" style={{ width: `${t.win_rate}%` }} />
                  </div>
                  <span className="text-sm font-mono text-[#00ff88] tabular-nums">{t.win_rate.toFixed(0)}%</span>
                </div>
                <div className="text-xs text-[#8892a6] font-mono uppercase mt-1">Win Rate</div>
              </div>

              <button className="pro-btn text-sm py-2 px-4 flex-shrink-0">View</button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trader details */}
      {selected && details && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pro-card p-5 bg-[#1e2a47]/30">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#1e2a47]">
            <h3 className="text-xl font-mono font-bold text-white uppercase">Trader Details</h3>
            <button onClick={() => setSelected(null)} className="text-sm font-mono py-2 px-4 text-[#8892a6] hover:text-white">Close</button>
          </div>

          <div className="mb-4">
            <div className="text-xs text-[#8892a6] font-mono uppercase mb-1">Address</div>
            <code className="text-sm font-mono text-[#00d4ff]">{details.address}</code>
          </div>

          {details.strategy_analysis?.status === "success" && (
            <div className="p-4 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-sm mb-4">
              <div className="text-xs text-[#8892a6] font-mono uppercase mb-2">AI Strategy Analysis</div>
              <div className="text-sm font-mono text-white whitespace-pre-wrap">{details.strategy_analysis.analysis}</div>
            </div>
          )}

          <div>
            <div className="text-sm font-mono font-bold text-white uppercase mb-3">Recent Trades ({details.trades?.length || 0})</div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {details.trades?.slice(0, 5).map((trade: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#141b2d] rounded-sm">
                  <div>
                    <div className="text-sm font-mono text-white mb-1">{trade.type?.replace(/_/g, " ")}</div>
                    <div className="text-sm text-[#8892a6] font-mono">{trade.protocol} • ${(trade.amount / 1000).toFixed(1)}K</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-mono font-bold ${trade.pnl > 0 ? "text-[#00ff88]" : "text-[#ff4757]"}`}>
                      {trade.pnl > 0 ? "+" : ""}{trade.pnl_pct?.toFixed(1)}%
                    </div>
                    <div className="text-sm text-[#8892a6] font-mono">{formatDistanceToNow(new Date(trade.timestamp), { addSuffix: true })}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#1e2a47]">
            <button className="w-full pro-btn-primary text-sm font-mono py-3">Copy This Trader (Coming Soon)</button>
            <div className="mt-2 text-sm text-[#8892a6] font-mono text-center">Auto-copy trades from this wallet to your account</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
