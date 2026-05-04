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
      <div className="pro-card p-4">
        <div className="flex items-center justify-center h-20">
          <div className="text-[#00d4ff] font-mono text-xs">Loading...</div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "TVL",
      value: `$${formatNumber(stats.tvl)}`,
      color: "text-[#00d4ff]",
    },
    {
      label: "Daily TX",
      value: formatNumber(stats.daily_transactions),
      color: "text-[#00ff88]",
    },
    {
      label: "Active 24h",
      value: formatNumber(stats.active_addresses_24h),
      color: "text-[#ffa502]",
    },
    {
      label: "TPS",
      value: formatNumber(stats.tps),
      color: "text-[#a855f7]",
    },
    {
      label: "Block",
      value: formatNumber(stats.block_number),
      color: "text-[#8892a6]",
    },
    {
      label: "Gas",
      value: `${stats.gas_price_gwei}`,
      color: "text-[#8892a6]",
    },
  ];

  return (
    <div className="pro-card p-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e2a47]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-[#00d4ff] to-[#a855f7] rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Mantle Network
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-[10px] font-mono text-[#00ff88]">LIVE</span>
        </div>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="pro-card-hover p-2.5"
          >
            <div className="text-[9px] text-[#8892a6] font-mono mb-1 uppercase tracking-wide">
              {metric.label}
            </div>
            <div className={`text-sm font-mono font-bold ${metric.color}`}>
              {metric.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Compact Footer */}
      <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
        <div className="text-[#8892a6]">
          Powered by <span className="text-[#00d4ff]">MANTLE</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://mantlescan.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00d4ff] hover:text-[#00b8e6] transition-colors"
          >
            Explorer
          </a>
          <span className="text-[#8892a6]">•</span>
          <a
            href="https://www.mantle.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00d4ff] hover:text-[#00b8e6] transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
}
