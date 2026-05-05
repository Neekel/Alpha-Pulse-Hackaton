"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface Token {
  address: string;
  name: string;
  symbol: string;
  total_supply: number;
  deployer: string;
  tx_hash: string;
  deployed_at: string;
  age_hours: number;
  is_verified: boolean;
  safety_score: number;
  risk_label: string;
  risk_color: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function fmtSupply(n: number) {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}

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
      const res = await fetch(`${API_URL}/api/tokens/new?blocks_back=100`);
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

  return (
    <div className="pro-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#1e2a47]">
        <div>
          <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">Token Scanner</h2>
          <p className="text-sm text-[#8892a6] font-mono mt-1">
            New ERC20 deployments · Safety score · Honeypot detection
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats && (
            <span className="text-sm font-mono text-[#8892a6]">
              <span className="text-[#00d4ff] font-bold">{stats.new_tokens_1h}</span> new/hr
            </span>
          )}
          <div className="w-2.5 h-2.5 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-sm font-mono text-[#00ff88] font-bold">SCANNING</span>
        </div>
      </div>

      {/* Stats — 3 big cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "New Tokens / hr", value: stats.new_tokens_1h, color: "text-[#00d4ff]" },
            { label: "Est. 24h Deployments", value: stats.new_tokens_24h, color: "text-[#ffa502]" },
            { label: "Scanned Now", value: tokens.length, color: "text-[#00ff88]" },
          ].map(item => (
            <div key={item.label} className="pro-card p-4">
              <div className="text-xs text-[#8892a6] font-mono uppercase mb-2">{item.label}</div>
              <div className={`text-3xl font-mono font-bold tabular-nums ${item.color}`}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(["ALL", "SAFE", "RISKY"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-mono rounded-sm transition-colors ${
              filter === f ? "bg-[#00d4ff] text-[#0a0e27] font-bold" : "bg-[#1e2a47] text-[#8892a6] hover:bg-[#2a3f5f]"
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#00d4ff] font-mono">Scanning blockchain...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#8892a6] font-mono">No new tokens found in recent blocks</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((token, i) => (
            <div key={token.address} className="pro-card-hover p-4 flex items-center gap-4">
              {/* Symbol badge */}
              <div className="w-12 h-12 bg-[#1e2a47] rounded-sm flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-mono font-bold text-white">{token.symbol.slice(0, 4)}</span>
              </div>

              {/* Name + address */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-lg font-mono font-bold text-white">{token.symbol}</span>
                  <span className="text-sm text-[#8892a6] font-mono">{token.name}</span>
                  {token.is_verified && (
                    <span className="text-xs font-mono text-[#00ff88] px-1.5 py-0.5 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-sm">✓ Verified</span>
                  )}
                </div>
                <a href={`https://mantlescan.xyz/address/${token.address}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs font-mono text-[#00d4ff] hover:text-[#00b8e6]">
                  {token.address.slice(0, 10)}...{token.address.slice(-6)}
                </a>
              </div>

              {/* Supply */}
              <div className="text-right flex-shrink-0 hidden sm:block">
                <div className="text-xs text-[#8892a6] font-mono">Supply</div>
                <div className="text-base font-mono font-bold text-white tabular-nums">{fmtSupply(token.total_supply)}</div>
              </div>

              {/* Safety score */}
              <div className="flex-shrink-0 text-right">
                <div className="text-xs text-[#8892a6] font-mono mb-1">Safety</div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-[#1e2a47] rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${token.safety_score}%`, backgroundColor: token.risk_color }} />
                  </div>
                  <span className="text-sm font-mono font-bold tabular-nums" style={{ color: token.risk_color }}>
                    {token.safety_score}
                  </span>
                </div>
              </div>

              {/* Risk badge */}
              <div className="flex-shrink-0">
                <span className="text-sm font-mono font-bold px-3 py-1.5 rounded-sm"
                  style={{ color: token.risk_color, backgroundColor: `${token.risk_color}20`, border: `1px solid ${token.risk_color}40` }}>
                  {token.risk_label}
                </span>
              </div>

              {/* Age */}
              <div className="text-right flex-shrink-0 hidden md:block">
                <div className="text-xs text-[#8892a6] font-mono">
                  {formatDistanceToNow(new Date(token.deployed_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
