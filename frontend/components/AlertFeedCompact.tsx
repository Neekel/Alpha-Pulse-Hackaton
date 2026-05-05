"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Alert {
  id: string; type: string; priority: string; confidence: number;
  wallet: string; protocol: string; action: string; amount: number; timestamp: string;
}

const typeIcon = (t: string) => ({ WHALE_BUY: "W", LIQUIDITY_EXIT: "L", SMART_CLUSTER: "C", MOMENTUM_BUILD: "M" }[t] ?? "A");
const typeBg = (t: string) => ({ WHALE_BUY: "bg-[#00d4ff] text-[#0a0e27]", LIQUIDITY_EXIT: "bg-[#ff4757] text-white", SMART_CLUSTER: "bg-[#a855f7] text-white", MOMENTUM_BUILD: "bg-[#00ff88] text-[#0a0e27]" }[t] ?? "bg-[#8892a6] text-white");
const prioColor = (p: string) => ({ CRITICAL: "text-[#ff4757]", HIGH: "text-[#ffa502]", MEDIUM: "text-[#00d4ff]" }[p] ?? "text-[#8892a6]");

export function AlertFeedCompact({ anomalies, loading }: { anomalies: Alert[]; loading: boolean }) {
  if (loading) return (
    <div className="pro-card p-5 flex items-center justify-center h-48">
      <div className="text-[#00d4ff] font-mono">Loading alerts...</div>
    </div>
  );

  return (
    <div className="pro-card p-5">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#1e2a47]">
        <div>
          <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">Live Smart Money Alerts</h2>
          <p className="text-sm text-[#8892a6] font-mono mt-1">Real-time whale movements &amp; anomalies on Mantle</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-sm font-mono text-[#00ff88] font-bold">MONITORING</span>
        </div>
      </div>

      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {anomalies.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-center">
            <div>
              <div className="text-[#8892a6] font-mono mb-2">No alerts detected</div>
              <div className="text-sm text-[#8892a6]/60 font-mono">Monitoring blockchain...</div>
            </div>
          </div>
        ) : anomalies.map((alert, idx) => (
          <motion.div key={alert.id || idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }} className="pro-card-hover p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-sm flex items-center justify-center font-mono text-base font-bold flex-shrink-0 ${typeBg(alert.type)}`}>
                {typeIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-mono font-bold text-white truncate">{alert.type.replace(/_/g, " ")}</span>
                  <span className={`text-sm font-mono font-bold flex-shrink-0 ml-2 ${prioColor(alert.priority)}`}>{alert.priority}</span>
                </div>
                <div className="text-sm font-mono text-[#8892a6] mb-2 truncate">{alert.action}</div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-mono font-bold tabular-nums text-[#00d4ff]">${(alert.amount / 1000).toFixed(1)}K</span>
                  <span className="text-sm font-mono text-[#8892a6]">{formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-[#1e2a47] rounded-full overflow-hidden">
                    <motion.div className="h-full bg-[#00d4ff]" initial={{ width: 0 }}
                      animate={{ width: `${alert.confidence * 100}%` }} transition={{ duration: 0.5, delay: idx * 0.05 }} />
                  </div>
                  <span className="text-sm font-mono text-[#00d4ff] tabular-nums">{(alert.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-[#1e2a47] grid grid-cols-3 gap-3">
        {[
          { label: "Critical", value: anomalies.filter(a => a.priority === "CRITICAL").length, color: "text-[#ff4757]" },
          { label: "High", value: anomalies.filter(a => a.priority === "HIGH").length, color: "text-[#ffa502]" },
          { label: "Avg Conf", value: anomalies.length > 0 ? `${Math.round(anomalies.reduce((s, a) => s + a.confidence, 0) / anomalies.length * 100)}%` : "0%", color: "text-[#00d4ff]" },
        ].map(item => (
          <div key={item.label} className="text-center">
            <div className="text-xs text-[#8892a6] font-mono uppercase mb-1">{item.label}</div>
            <div className={`text-2xl font-mono font-bold tabular-nums ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
