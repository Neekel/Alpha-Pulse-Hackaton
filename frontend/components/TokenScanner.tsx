"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  total_supply: number;
  deployer: string;
  tx_hash: string;
  deployed_at: string;
  age_hours: number;
  is_verified: boolean;
  holders: number;
  safety_score: number;
  risk_label: string;
  risk_color: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function TokenScanner() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "SAFE" | "RISKY">("ALL");

  useEffect(() => {
    fetchTokens();
    const iv = setInterval(fetchTokens, 60_000);
    return () => clearInterval(iv);
  }, []);

  const fetchTokens = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tokens/new?blocks_back=300`);
      if (res.ok) {
        const data = await res.json();
        setTokens(data.tokens || []);
        setStats(data.stats);
      }
    } catch (e) {
      console.error("Token scanner error:", e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = tokens.filter(t => {
    if (filter === "SAFE") return t.safety_score >= 70;
    if (filter === "RISKY") return t.safety_score < 50;
    return true;
  });

  const ScoreBar = ({ score }: { score: number }) => (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-[#1e2a47] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${score}%`,
            backgroundColor: score >= 70 ? "#00ff88" : score >= 40 ? "#ffa502" : "#ff4757",
          }}
        />
      </div>
      <span className="text-xs font-mono tabular-nums" style={{
        color: score >= 70 ? "#00ff88" : score >= 40 ? "#ffa502" : "#ff4757"
      }}>
        {score}
      </span>
    </div>
  );

  return (
    <div className="pro-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e2a47]">
        <div>
          <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
            Token Scanner
          </h2>
          <p className="text-xs text-[#8892a6] font-mono mt-1">
            New ERC20 deployments · Safety score · Honeypot detection
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats && (
            <div className="text-xs font-mono text-[#8892a6]">
              <span className="text-[#00d4ff]">{stats.new_tokens_1h}</span> new/hr
            </div>
          )}
          <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-xs font-mono text-[#00ff88]">SCANNING</span>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="pro-card p-4">
            <div className="metric-label mb-1">New Tokens / hr</div>
            <div className="metric-value text-[#00d4ff]">{stats.new_tokens_1h}</div>
          </div>
          <div className="pro-card p-4">
            <div className="metric-label mb-1">Est. 24h Deployments</div>
            <div className="metric-value text-[#ffa502]">{stats.new_tokens_24h}</div>
          </div>
          <div className="pro-card p-4">
            <div className="metric-label mb-1">Scanned Now</div>
            <div className="metric-value text-[#00ff88]">{tokens.length}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(["ALL", "SAFE", "RISKY"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-xs font-mono rounded-sm transition-colors ${
              filter === f ? "bg-[#00d4ff] text-[#0a0e27]" : "bg-[#1e2a47] text-[#8892a6] hover:bg-[#2a3f5f]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#00d4ff] font-mono text-sm">Scanning blockchain...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#8892a6] font-mono text-sm">No new tokens found in recent blocks</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Address</th>
                <th>Supply</th>
                <th>Verified</th>
                <th>Safety Score</th>
                <th>Risk</th>
                <th>Age</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((token, i) => (
                <motion.tr
                  key={token.address}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <td>
                    <div>
                      <div className="text-white font-bold text-sm">{token.symbol}</div>
                      <div className="text-[#8892a6] text-xs">{token.name}</div>
                    </div>
                  </td>
                  <td>
                    <a
                      href={`https://mantlescan.xyz/address/${token.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00d4ff] hover:text-[#00b8e6] font-mono text-xs"
                    >
                      {token.address.slice(0, 8)}...{token.address.slice(-4)}
                    </a>
                  </td>
                  <td className="text-[#8892a6] tabular-nums text-xs">
                    {token.total_supply > 1e12
                      ? `${(token.total_supply / 1e12).toFixed(1)}T`
                      : token.total_supply > 1e9
                      ? `${(token.total_supply / 1e9).toFixed(1)}B`
                      : token.total_supply > 1e6
                      ? `${(token.total_supply / 1e6).toFixed(1)}M`
                      : token.total_supply.toLocaleString()}
                  </td>
                  <td>
                    {token.is_verified ? (
                      <span className="text-[#00ff88] text-xs font-bold">✓ YES</span>
                    ) : (
                      <span className="text-[#ff4757] text-xs">✗ NO</span>
                    )}
                  </td>
                  <td>
                    <ScoreBar score={token.safety_score} />
                  </td>
                  <td>
                    <span
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded-sm"
                      style={{
                        color: token.risk_color,
                        backgroundColor: `${token.risk_color}20`,
                        border: `1px solid ${token.risk_color}40`,
                      }}
                    >
                      {token.risk_label}
                    </span>
                  </td>
                  <td className="text-[#8892a6] text-xs">
                    {formatDistanceToNow(new Date(token.deployed_at), { addSuffix: true })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
