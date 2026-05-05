"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface NetworkMetrics {
  block_number: number;
  gas_price_gwei: number;
  tps: number;
  block_time_sec: number;
  latest_block_txs: number;
  gas_utilization_pct: number;
  congestion: string;
  congestion_color: string;
  timestamp: string;
}

interface GasPoint {
  block: number;
  timestamp: string;
  gas_price_gwei: number;
  base_fee_gwei: number;
  utilization_pct: number;
  tx_count: number;
}

interface BridgeData {
  bridge_txs_count: number;
  total_bridged_eth: number;
  total_bridged_usd: number;
  recent_txs: any[];
}

// Heatmap color: green → yellow → orange → red based on utilization
function heatColor(pct: number): string {
  if (pct >= 80) return "#ff4757";
  if (pct >= 60) return "#ff6b35";
  if (pct >= 40) return "#ffa502";
  if (pct >= 20) return "#eccc68";
  return "#00ff88";
}

// Gas Heatmap — 7×24 grid of colored cells like Etherscan
function GasHeatmap({ data }: { data: GasPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-[#8892a6] font-mono text-sm">
        Collecting block data...
      </div>
    );
  }

  const maxUtil = Math.max(...data.map(d => d.utilization_pct), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-mono font-bold text-white uppercase tracking-wider">
          Gas Utilization Heatmap
        </span>
        <div className="flex items-center gap-2 text-xs font-mono text-[#8892a6]">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#00ff88" }} /> Low
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#ffa502" }} /> Med
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#ff4757" }} /> High
          </span>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="flex flex-wrap gap-1">
        {data.map((point, i) => {
          const color = heatColor(point.utilization_pct);
          const opacity = 0.3 + (point.utilization_pct / maxUtil) * 0.7;
          return (
            <div
              key={i}
              className="relative group"
              style={{ width: 28, height: 28 }}
            >
              <div
                className="w-full h-full rounded-sm cursor-pointer transition-transform hover:scale-110"
                style={{ backgroundColor: color, opacity }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 pointer-events-none">
                <div className="bg-[#0a0e27] border border-[#1e2a47] rounded-sm px-2 py-1 text-[10px] font-mono whitespace-nowrap">
                  <div className="text-white">Block #{point.block.toLocaleString()}</div>
                  <div style={{ color }}>{point.utilization_pct}% utilized</div>
                  <div className="text-[#8892a6]">{point.tx_count} txs</div>
                  <div className="text-[#00d4ff]">{point.gas_price_gwei} Gwei</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats row below heatmap */}
      <div className="flex items-center justify-between mt-3 text-xs font-mono text-[#8892a6]">
        <span>← Older blocks</span>
        <span>
          Avg utilization:{" "}
          <span className="text-white font-bold">
            {Math.round(data.reduce((s, d) => s + d.utilization_pct, 0) / data.length)}%
          </span>
        </span>
        <span>Latest →</span>
      </div>
    </div>
  );
}

export function OnChainPulse() {
  const [network, setNetwork] = useState<NetworkMetrics | null>(null);
  const [gasHistory, setGasHistory] = useState<GasPoint[]>([]);
  const [bridge, setBridge] = useState<BridgeData | null>(null);
  const [addresses, setAddresses] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 15_000);
    return () => clearInterval(iv);
  }, []);

  const fetchAll = async () => {
    try {
      const [netRes, gasRes, bridgeRes, addrRes] = await Promise.all([
        fetch(`${API_URL}/api/pulse/network`),
        fetch(`${API_URL}/api/pulse/gas-history?blocks=10`),
        fetch(`${API_URL}/api/pulse/bridge`),
        fetch(`${API_URL}/api/pulse/addresses?blocks=20`),
      ]);
      if (netRes.ok) setNetwork(await netRes.json());
      if (gasRes.ok) { const d = await gasRes.json(); setGasHistory(d.history || []); }
      if (bridgeRes.ok) setBridge(await bridgeRes.json());
      if (addrRes.ok) setAddresses(await addrRes.json());
    } catch (e) {
      console.error("OnChainPulse error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pro-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#1e2a47]">
        <div>
          <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">
            On-Chain Pulse
          </h2>
          <p className="text-sm text-[#8892a6] font-mono mt-1">
            Gas · TPS · Bridge · Active Addresses — Mantle Mainnet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-sm font-mono text-[#00ff88] font-bold">LIVE</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-[#00d4ff] font-mono">Fetching chain data...</div>
        </div>
      ) : (
        <>
          {/* Network Metrics — 4 big cards */}
          {network && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="pro-card p-4">
                <div className="text-xs text-[#8892a6] font-mono uppercase mb-2">Gas Price</div>
                <div className="text-3xl font-mono font-bold text-[#00d4ff] tabular-nums">
                  {network.gas_price_gwei}
                </div>
                <div className="text-sm text-[#8892a6] font-mono mt-1">Gwei</div>
              </div>

              <div className="pro-card p-4">
                <div className="text-xs text-[#8892a6] font-mono uppercase mb-2">TPS</div>
                <div className="text-3xl font-mono font-bold text-[#00ff88] tabular-nums">
                  {network.tps}
                </div>
                <div className="text-sm text-[#8892a6] font-mono mt-1">Block: {network.block_time_sec}s</div>
              </div>

              <div className="pro-card p-4">
                <div className="text-xs text-[#8892a6] font-mono uppercase mb-2">Network Load</div>
                <div className="text-3xl font-mono font-bold tabular-nums" style={{ color: network.congestion_color }}>
                  {network.gas_utilization_pct}%
                </div>
                <div className="mt-2 h-2 bg-[#1e2a47] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${network.gas_utilization_pct}%`, backgroundColor: network.congestion_color }} />
                </div>
                <div className="text-sm font-mono mt-1" style={{ color: network.congestion_color }}>
                  {network.congestion}
                </div>
              </div>

              <div className="pro-card p-4">
                <div className="text-xs text-[#8892a6] font-mono uppercase mb-2">Latest Block</div>
                <div className="text-2xl font-mono font-bold text-[#ffa502] tabular-nums">
                  #{network.block_number.toLocaleString()}
                </div>
                <div className="text-sm text-[#8892a6] font-mono mt-1">{network.latest_block_txs} txs</div>
              </div>
            </div>
          )}

          {/* Gas Heatmap */}
          <div className="pro-card p-4 mb-4">
            <GasHeatmap data={gasHistory} />
          </div>

          {/* Bridge + Addresses */}
          <div className="grid md:grid-cols-2 gap-3">
            <div className="pro-card p-4">
              <div className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">
                Bridge Activity
              </div>
              {bridge ? (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Deposits", value: String(bridge.bridge_txs_count), color: "text-[#00d4ff]" },
                    { label: "ETH Bridged", value: String(bridge.total_bridged_eth), color: "text-[#00ff88]" },
                    { label: "USD Value", value: `$${bridge.total_bridged_usd.toLocaleString()}`, color: "text-[#ffa502]" },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="text-xs text-[#8892a6] font-mono mb-1">{item.label}</div>
                      <div className={`text-xl font-mono font-bold tabular-nums ${item.color}`}>{item.value}</div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-sm text-[#8892a6] font-mono">Loading...</div>}
            </div>

            <div className="pro-card p-4">
              <div className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">
                Active Addresses
              </div>
              {addresses ? (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Unique Addr", value: addresses.unique_addresses.toLocaleString(), color: "text-[#00d4ff]" },
                    { label: "Total Txs", value: addresses.total_transactions.toLocaleString(), color: "text-[#00ff88]" },
                    { label: "Blocks", value: String(addresses.blocks_scanned), color: "text-[#8892a6]" },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="text-xs text-[#8892a6] font-mono mb-1">{item.label}</div>
                      <div className={`text-xl font-mono font-bold tabular-nums ${item.color}`}>{item.value}</div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-sm text-[#8892a6] font-mono">Loading...</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
