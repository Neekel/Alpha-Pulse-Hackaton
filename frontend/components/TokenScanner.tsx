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

      {/* Stats — 4 horizontal cards like Executive Dashboard */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div className="pro-card p-4 border-[#00d4ff]/20" style={{background:"linear-gradient(135deg,rgba(0,212,255,0.06),transparent)"}}>
            <div className="text-xs text-[#8892a6] font-mono uppercase mb-1">New / hr</div>
            <div className="text-2xl font-mono font-bold tabular-nums text-[#00d4ff]">{stats.new_tokens_1h}</div>
            <div className="text-xs text-[#00d4ff] font-mono mt-0.5">deployments</div>
          </div>
          <div className="pro-card p-4 border-[#ffa502]/20" style={{background:"linear-gradient(135deg,rgba(255,165,2,0.06),transparent)"}}>
            <div className="text-xs text-[#8892a6] font-mono uppercase mb-1">Est. 24h</div>
            <div className="text-2xl font-mono font-bold tabular-nums text-[#ffa502]">{stats.new_tokens_24h}</div>
            <div className="text-xs text-[#ffa502] font-mono mt-0.5">projected</div>
          </div>
          <div className="pro-card p-4 border-[#00ff88]/20" style={{background:"linear-gradient(135deg,rgba(0,255,136,0.06),transparent)"}}>
            <div className="text-xs text-[#8892a6] font-mono uppercase mb-1">Scanned</div>
            <div className="text-2xl font-mono font-bold tabular-nums text-[#00ff88]">{tokens.length}</div>
            <div className="text-xs text-[#00ff88] font-mono mt-0.5">tokens found</div>
          </div>
          <div className="pro-card p-4 border-[#a855f7]/20" style={{background:"linear-gradient(135deg,rgba(168,85,247,0.06),transparent)"}}>
            <div className="text-xs text-[#8892a6] font-mono uppercase mb-1">Safe Tokens</div>
            <div className="text-2xl font-mono font-bold tabular-nums text-[#a855f7]">
              {tokens.filter(t => t.safety_score >= 70).length}
            </div>
            <div className="text-xs text-[#a855f7] font-mono mt-0.5">score ≥ 70</div>
          </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {filtered.map((token) => (
            <div key={token.address} className="pro-card p-4 hover:border-[#00d4ff]/30 transition-colors">
              {/* Symbol + verified */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#1e2a47] rounded-sm flex items-center justify-center">
                    <span className="text-xs font-mono font-bold text-white">{token.symbol.slice(0,3)}</span>
                  </div>
                  <div>
                    <div className="text-base font-mono font-bold text-white">{token.symbol}</div>
                    <div className="text-xs text-[#8892a6] font-mono truncate max-w-[80px]">{token.name}</div>
                  </div>
                </div>
                {token.is_verified && (
                  <span className="text-xs font-mono text-[#00ff88] px-1 py-0.5 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-sm">✓</span>
                )}
              </div>

              {/* Address */}
              <a href={`https://mantlescan.xyz/address/${token.address}`} target="_blank" rel="noopener noreferrer"
                className="text-xs font-mono text-[#00d4ff] hover:text-[#00b8e6] block mb-3">
                {token.address.slice(0,8)}...{token.address.slice(-4)}
              </a>

              {/* Safety score — big */}
              <div className="text-2xl font-mono font-bold tabular-nums mb-1" style={{ color: token.risk_color }}>
                {token.safety_score}
              </div>
              <div className="h-1.5 bg-[#1e2a47] rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full" style={{ width: `${token.safety_score}%`, backgroundColor: token.risk_color }} />
              </div>

              {/* Risk badge + age */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-sm"
                  style={{ color: token.risk_color, background: `${token.risk_color}20`, border: `1px solid ${token.risk_color}40` }}>
                  {token.risk_label}
                </span>
                <span className="text-xs text-[#8892a6] font-mono">
                  {formatDistanceToNow(new Date(token.deployed_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
