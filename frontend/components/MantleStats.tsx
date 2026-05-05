"use client";

import { useState, useEffect } from "react";

interface MantleStatsData {
  chain_id: number;
  block_number: number;
  gas_price_gwei: number;
  tvl: number;
  daily_transactions: number;
  active_addresses_24h: number;
  tps: number;
}

const fmt = (n: number) => {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
};

export function MantleStats() {
  const [stats, setStats] = useState<MantleStatsData | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`${API_URL}/api/mantle/stats`);
        if (r.ok) setStats(await r.json());
      } catch {}
    };
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, []);

  const metrics = stats
    ? [
        { label: "TVL", value: `$${fmt(stats.tvl)}`, color: "text-[#00d4ff]" },
        { label: "Daily Txs", value: fmt(stats.daily_transactions), color: "text-[#00ff88]" },
        { label: "Active Addr", value: fmt(stats.active_addresses_24h), color: "text-[#ffa502]" },
        { label: "TPS", value: `${stats.tps}`, color: "text-[#a855f7]" },
        { label: "Block", value: fmt(stats.block_number), color: "text-[#8892a6]" },
        { label: "Gas", value: `${stats.gas_price_gwei} Gwei`, color: "text-[#8892a6]" },
      ]
    : [];

  return (
    <div className="pro-card px-4 py-3 mb-3">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-5 h-5 bg-gradient-to-br from-[#00d4ff] to-[#a855f7] rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">M</span>
          </div>
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Mantle</span>
          <span className="text-[10px] font-mono text-[#00ff88] px-1.5 py-0.5 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-sm">Mainnet</span>
          <span className="text-[10px] font-mono text-[#8892a6]">Chain {stats?.chain_id ?? 5000}</span>
        </div>

        {/* Metrics inline */}
        <div className="flex items-center gap-4 overflow-x-auto">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] text-[#8892a6] font-mono">{m.label}</span>
              <span className={`text-sm font-mono font-bold tabular-nums ${m.color}`}>{m.value}</span>
            </div>
          ))}
          {!stats && <span className="text-[10px] text-[#8892a6] font-mono">Loading...</span>}
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0 text-[10px] font-mono">
          <a href="https://mantlescan.xyz" target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:text-[#00b8e6]">Explorer</a>
          <span className="text-[#1e2a47]">•</span>
          <a href="https://bridge.mantle.xyz" target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:text-[#00b8e6]">Bridge</a>
          <span className="text-[#1e2a47]">•</span>
          <a href="https://www.mantle.xyz" target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:text-[#00b8e6]">Mantle.xyz</a>
        </div>
      </div>
    </div>
  );
}
