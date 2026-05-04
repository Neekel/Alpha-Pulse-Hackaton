"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface Trader {
  rank: number;
  address: string;
  profit: number;
  profit_pct: number;
  win_rate: number;
  trades: number;
  total_volume: number;
  strategy: string;
  followers: number;
  last_trade: string;
}

export function CopyTradingDashboard() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [selectedTrader, setSelectedTrader] = useState<string | null>(null);
  const [traderDetails, setTraderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchTopTraders();
    const interval = setInterval(fetchTopTraders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTopTraders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/copy-trading/top-traders?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setTraders(data.traders || []);
      }
    } catch (error) {
      console.error("Failed to fetch top traders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTraderDetails = async (address: string) => {
    try {
      const response = await fetch(`${API_URL}/api/copy-trading/trader/${address}`);
      if (response.ok) {
        const data = await response.json();
        setTraderDetails(data);
      }
    } catch (error) {
      console.error("Failed to fetch trader details:", error);
    }
  };

  const handleTraderClick = (address: string) => {
    setSelectedTrader(address);
    fetchTraderDetails(address);
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case "Whale Follower":
        return "text-[#00d4ff]";
      case "Smart Money":
        return "text-[#00ff88]";
      case "Liquidity Hunter":
        return "text-[#ffa502]";
      default:
        return "text-[#8892a6]";
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="pro-card p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-[#00d4ff] font-mono">Loading traders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pro-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e2a47]">
        <div>
          <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
            Copy Trading Leaderboard
          </h2>
          <p className="text-xs text-[#8892a6] font-mono mt-1">
            Track top traders' performance → Copy their winning strategies automatically
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-xs font-mono text-[#00ff88]">LIVE</span>
        </div>
      </div>

      {/* Traders Table */}
      <div className="overflow-x-auto mb-6">
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Trader</th>
              <th>Strategy</th>
              <th>Profit</th>
              <th>Win Rate</th>
              <th>Trades</th>
              <th>Volume</th>
              <th>Followers</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {traders.map((trader, idx) => (
              <motion.tr
                key={trader.address}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="cursor-pointer"
                onClick={() => handleTraderClick(trader.address)}
              >
                <td>
                  <span className="text-lg">{getRankBadge(trader.rank)}</span>
                </td>
                <td>
                  <code className="text-[#00d4ff]">
                    {trader.address.slice(0, 6)}...{trader.address.slice(-4)}
                  </code>
                </td>
                <td>
                  <span className={`text-xs font-bold ${getStrategyColor(trader.strategy)}`}>
                    {trader.strategy}
                  </span>
                </td>
                <td>
                  <div>
                    <div className="text-[#00ff88] font-bold">
                      ${(trader.profit / 1000).toFixed(1)}K
                    </div>
                    <div className="text-xs text-[#8892a6]">
                      +{trader.profit_pct.toFixed(1)}%
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-[#1e2a47] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00ff88]"
                        style={{ width: `${trader.win_rate}%` }}
                      />
                    </div>
                    <span className="text-[#00ff88] tabular-nums">
                      {trader.win_rate.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="tabular-nums">{trader.trades}</td>
                <td className="tabular-nums">
                  ${(trader.total_volume / 1000000).toFixed(2)}M
                </td>
                <td className="tabular-nums text-[#8892a6]">{trader.followers}</td>
                <td>
                  <button className="pro-btn text-xs">
                    View
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Trader Details Modal */}
      {selectedTrader && traderDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pro-card p-6 bg-[#1e2a47]/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono font-bold text-white uppercase">
              Trader Details
            </h3>
            <button
              onClick={() => setSelectedTrader(null)}
              className="text-[#8892a6] hover:text-white font-mono text-xs"
            >
              Close
            </button>
          </div>

          <div className="mb-4">
            <div className="text-xs text-[#8892a6] font-mono mb-1">Address</div>
            <code className="text-sm text-[#00d4ff] font-mono">
              {traderDetails.address}
            </code>
          </div>

          {/* AI Strategy Analysis */}
          {traderDetails.strategy_analysis?.status === "success" && (
            <div className="p-4 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-sm mb-4">
              <div className="text-xs font-mono font-bold text-[#00d4ff] uppercase mb-2">
                AI Strategy Analysis
              </div>
              <div className="text-sm text-white font-mono whitespace-pre-wrap">
                {traderDetails.strategy_analysis.analysis}
              </div>
            </div>
          )}

          {/* Recent Trades */}
          <div>
            <div className="text-xs font-mono font-bold text-white uppercase mb-3">
              Recent Trades ({traderDetails.trades?.length || 0})
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {traderDetails.trades?.slice(0, 5).map((trade: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-[#141b2d] rounded-sm"
                >
                  <div className="flex-1">
                    <div className="text-xs font-mono text-white mb-1">
                      {trade.type?.replace(/_/g, " ")}
                    </div>
                    <div className="text-xs text-[#8892a6] font-mono">
                      {trade.protocol} • ${(trade.amount / 1000).toFixed(1)}K
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-mono font-bold ${
                      trade.pnl > 0 ? "text-[#00ff88]" : "text-[#ff4757]"
                    }`}>
                      {trade.pnl > 0 ? "+" : ""}{trade.pnl_pct?.toFixed(1)}%
                    </div>
                    <div className="text-xs text-[#8892a6] font-mono">
                      {formatDistanceToNow(new Date(trade.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Copy Trade Button */}
          <div className="mt-6 pt-4 border-t border-[#1e2a47]">
            <button className="w-full pro-btn-primary py-3">
              Copy This Trader (Coming Soon)
            </button>
            <div className="mt-2 text-xs text-[#8892a6] font-mono text-center">
              Auto-copy trades from this wallet to your account
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Banner */}
      <div className="mt-6 p-4 bg-[#1e2a47]/20 border border-[#1e2a47] rounded-sm">
        <div className="text-xs text-[#8892a6] font-mono">
          <span className="text-[#00d4ff] font-bold">Copy Trading:</span> Follow successful traders automatically. When they buy, you buy. When they sell, you sell. AI analyzes their strategy to help you choose the best traders to copy.
        </div>
      </div>
    </div>
  );
}
