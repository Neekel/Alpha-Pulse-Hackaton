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

      <div className="space-y-2 mb-5">
        {traders.map((t, idx) => (
          <motion.div key={t.address} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }} onClick={() => handleClick(t.address)}
            className={`pro-card-hover px-4 py-3 cursor-pointer ${selected === t.address ? "border border-[#00d4ff]/40" : ""}`}>
            <div className="flex items-center gap-3">
              {/* Rank */}
              <div className="w-10 text-center flex-shrink-0">
                {t.rank <= 3
                  ? <span className="text-xl">{["🥇","🥈","🥉"][t.rank-1]}</span>
                  : <span className="text-base font-mono font-bold text-[#8892a6]">#{t.rank}</span>}
              </div>
              {/* Address + strategy */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-[#00d4ff]">{t.address.slice(0,6)}...{t.address.slice(-4)}</code>
                  <span className={`text-xs font-mono font-bold ${stratColor(t.strategy)}`}>{t.strategy}</span>
                </div>
                <div className="flex items-center gap-4 mt-0.5 text-xs font-mono text-[#8892a6]">
                  <span>{t.trades} trades</span>
                  <span>${(t.total_volume/1e6).toFixed(1)}M vol</span>
                  <span>{t.followers} followers</span>
                </div>
              </div>
              {/* Profit */}
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-mono font-bold tabular-nums text-[#00ff88]">${(t.profit/1000).toFixed(1)}K</div>
                <div className="text-xs font-mono text-[#00ff88]">+{t.profit_pct.toFixed(1)}%</div>
              </div>
              {/* Win rate */}
              <div className="flex-shrink-0 hidden sm:block w-28">
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-[#1e2a47] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00ff88]" style={{ width: `${t.win_rate}%` }} />
                  </div>
                  <span className="text-xs font-mono text-[#00ff88] tabular-nums w-8">{t.win_rate.toFixed(0)}%</span>
                </div>
                <div className="text-[10px] text-[#8892a6] font-mono mt-0.5">Win Rate</div>
              </div>
              <button className="pro-btn text-xs py-1.5 px-3 flex-shrink-0">View</button>
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
