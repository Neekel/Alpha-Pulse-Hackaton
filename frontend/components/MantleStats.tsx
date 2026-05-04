"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface MantleStats {
  network: string;
  chain_id: number;
  block_number: number;
  gas_price_gwei: number;
  tvl: number;
  daily_transactions: number;
  active_addresses_24h: number;
  tps: number;
  timestamp: string;
}

export function MantleStats() {
  const [stats, setStats] = useState<MantleStats | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mantle/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch Mantle stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading || !stats) {
    return (
      <div className="pro-card p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-[#00d4ff] font-mono text-sm">Loading Mantle stats...</div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Total Value Locked",
      value: `$${formatNumber(stats.tvl)}`,
      color: "text-[#00d4ff]",
    },
    {
      label: "Daily Transactions",
      value: formatNumber(stats.daily_transactions),
      color: "text-[#00ff88]",
    },
    {
      label: "Active Addresses (24h)",
      value: formatNumber(stats.active_addresses_24h),
      color: "text-[#ffa502]",
    },
    {
      label: "Transactions Per Second",
      value: `${formatNumber(stats.tps)} TPS`,
      color: "text-[#a855f7]",
    },
    {
      label: "Current Block",
      value: formatNumber(stats.block_number),
      color: "text-[#8892a6]",
    },
    {
      label: "Gas Price",
      value: `${stats.gas_price_gwei} Gwei`,
      color: "text-[#8892a6]",
    },
  ];

  return (
    <div className="pro-card p-6">
      {/* Header with Mantle Branding */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e2a47]">
        <div className="flex items-center gap-3">
          {/* Mantle Logo Placeholder */}
          <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#a855f7] rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <div>
            <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
              Mantle Network
            </h2>
            <p className="text-xs text-[#8892a6] font-mono mt-1">
              Layer 2 • Modular • High Performance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-xs font-mono text-[#00ff88]">LIVE</span>
        </div>
      </div>

      {/* Stats Grid - Single Row */}
      <div className="grid grid-cols-6 gap-3 mb-4">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="pro-card-hover p-3"
          >
            <div className="text-[9px] text-[#8892a6] font-mono mb-1.5 uppercase tracking-wide">{metric.label}</div>
            <div className={`text-sm font-mono font-bold ${metric.color}`}>{metric.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Footer - single line */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#8892a6] pt-3 border-t border-[#1e2a47]">
        <span>
          Powered by <span className="text-[#00d4ff] font-bold">MANTLE NETWORK</span>
          <span className="ml-1 text-[#1e2a47]">•</span>
          <span className="ml-1">Chain ID: {stats.chain_id}</span>
          <span className="ml-1 text-[#1e2a47]">•</span>
          <span className="ml-1 text-[#00ff88]">Mainnet</span>
        </span>
        <span className="flex items-center gap-2">
          <a href="https://mantlescan.xyz" target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:text-[#00b8e6] transition-colors">Explorer</a>
          <span>•</span>
          <a href="https://bridge.mantle.xyz" target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:text-[#00b8e6] transition-colors">Bridge</a>
          <span>•</span>
          <a href="https://www.mantle.xyz" target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:text-[#00b8e6] transition-colors">Learn More</a>
        </span>
      </div>
    </div>
  );
}
