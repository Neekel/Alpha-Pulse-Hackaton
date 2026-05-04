"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
  utilization_pct: number;
  tx_count: number;
}

interface BridgeData {
  bridge_txs_count: number;
  total_bridged_eth: number;
  total_bridged_usd: number;
  recent_txs: any[];
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
        fetch(`${API_URL}/api/pulse/gas-history?blocks=20`),
        fetch(`${API_URL}/api/pulse/bridge`),
        fetch(`${API_URL}/api/pulse/addresses?blocks=100`),
      ]);
      if (netRes.ok) setNetwork(await netRes.json());
      if (gasRes.ok) {
        const d = await gasRes.json();
        setGasHistory(d.history || []);
      }
      if (bridgeRes.ok) setBridge(await bridgeRes.json());
      if (addrRes.ok) setAddresses(await addrRes.json());
    } catch (e) {
      console.error("OnChainPulse error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Mini sparkline for gas history
  const GasSparkline = ({ data }: { data: GasPoint[] }) => {
    if (data.length < 2) return null;
    const values = data.map(d => d.gas_price_gwei);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const w = 120;
    const h = 32;
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg width={w} height={h} className="overflow-visible">
        <polyline
          points={pts}
          fill="none"
          stroke="#00d4ff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="pro-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e2a47]">
        <div>
          <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
            On-Chain Pulse
          </h2>
          <p className="text-xs text-[#8892a6] font-mono mt-1">
            Gas · TPS · Bridge · Active Addresses — Mantle Mainnet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-xs font-mono text-[#00ff88]">LIVE</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#00d4ff] font-mono text-sm">Fetching chain data...</div>
        </div>
      ) : (
        <>
          {/* Network Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {network && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pro-card p-4"
                >
                  <div className="metric-label mb-1">Gas Price</div>
                  <div className="metric-value text-[#00d4ff]">
                    {network.gas_price_gwei} <span className="text-xs text-[#8892a6]">Gwei</span>
                  </div>
                  <div className="mt-2">
                    <GasSparkline data={gasHistory} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="pro-card p-4"
                >
                  <div className="metric-label mb-1">TPS</div>
                  <div className="metric-value text-[#00ff88]">{network.tps}</div>
                  <div className="text-xs text-[#8892a6] font-mono mt-1">
                    Block time: {network.block_time_sec}s
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="pro-card p-4"
                >
                  <div className="metric-label mb-1">Network Load</div>
                  <div
                    className="metric-value font-bold"
                    style={{ color: network.congestion_color }}
                  >
                    {network.congestion}
                  </div>
                  <div className="mt-2 h-1.5 bg-[#1e2a47] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${network.gas_utilization_pct}%`,
                        backgroundColor: network.congestion_color,
                      }}
                    />
                  </div>
                  <div className="text-xs text-[#8892a6] font-mono mt-1">
                    {network.gas_utilization_pct}% utilized
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="pro-card p-4"
                >
                  <div className="metric-label mb-1">Latest Block</div>
                  <div className="metric-value text-[#ffa502]">
                    #{network.block_number.toLocaleString()}
                  </div>
                  <div className="text-xs text-[#8892a6] font-mono mt-1">
                    {network.latest_block_txs} txs
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* Bridge + Addresses row */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Bridge Activity */}
            <div className="pro-card p-4">
              <div className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
                Bridge Activity
              </div>
              {bridge ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#8892a6]">Deposits (recent)</span>
                    <span className="text-[#00d4ff]">{bridge.bridge_txs_count} txs</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#8892a6]">Total Bridged ETH</span>
                    <span className="text-[#00ff88]">{bridge.total_bridged_eth} ETH</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#8892a6]">Total Bridged USD</span>
                    <span className="text-[#ffa502]">
                      ${bridge.total_bridged_usd.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-[#8892a6] text-xs font-mono">Loading...</div>
              )}
            </div>

            {/* Active Addresses */}
            <div className="pro-card p-4">
              <div className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
                Active Addresses
              </div>
              {addresses ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#8892a6]">Unique Addresses</span>
                    <span className="text-[#00d4ff]">
                      {addresses.unique_addresses.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#8892a6]">Total Transactions</span>
                    <span className="text-[#00ff88]">
                      {addresses.total_transactions.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#8892a6]">Blocks Scanned</span>
                    <span className="text-[#8892a6]">{addresses.blocks_scanned}</span>
                  </div>
                </div>
              ) : (
                <div className="text-[#8892a6] text-xs font-mono">Loading...</div>
              )}
            </div>
          </div>

          {/* Gas History Table */}
          {gasHistory.length > 0 && (
            <div>
              <div className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
                Gas History (Last {gasHistory.length} Blocks)
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Block</th>
                      <th>Gas (Gwei)</th>
                      <th>Base Fee</th>
                      <th>Txs</th>
                      <th>Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gasHistory.slice(-10).reverse().map((point, i) => (
                      <tr key={i}>
                        <td className="text-[#8892a6] tabular-nums">#{point.block.toLocaleString()}</td>
                        <td className="text-[#00d4ff] tabular-nums">{point.gas_price_gwei}</td>
                        <td className="text-[#8892a6] tabular-nums">{point.base_fee_gwei}</td>
                        <td className="text-white tabular-nums">{point.tx_count}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1 bg-[#1e2a47] rounded-full overflow-hidden">
                              <div
                                className="h-full"
                                style={{
                                  width: `${point.utilization_pct}%`,
                                  backgroundColor:
                                    point.utilization_pct > 80 ? "#ff4757" :
                                    point.utilization_pct > 50 ? "#ffa502" : "#00ff88",
                                }}
                              />
                            </div>
                            <span className="text-xs text-[#8892a6] tabular-nums">
                              {point.utilization_pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
