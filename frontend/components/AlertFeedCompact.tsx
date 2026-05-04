"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Alert {
  id: string;
  type: string;
  priority: string;
  confidence: number;
  wallet: string;
  protocol: string;
  action: string;
  amount: number;
  timestamp: string;
}

interface AlertFeedCompactProps {
  anomalies: Alert[];
  loading: boolean;
}

export function AlertFeedCompact({ anomalies, loading }: AlertFeedCompactProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "WHALE_BUY":
        return "W";
      case "LIQUIDITY_EXIT":
        return "L";
      case "SMART_CLUSTER":
        return "C";
      case "MOMENTUM_BUILD":
        return "M";
      default:
        return "A";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "WHALE_BUY":
        return "bg-[#00d4ff] text-[#0a0e27]";
      case "LIQUIDITY_EXIT":
        return "bg-[#ff4757] text-white";
      case "SMART_CLUSTER":
        return "bg-[#a855f7] text-white";
      case "MOMENTUM_BUILD":
        return "bg-[#00ff88] text-[#0a0e27]";
      default:
        return "bg-[#8892a6] text-white";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "text-[#ff4757]";
      case "HIGH":
        return "text-[#ffa502]";
      case "MEDIUM":
        return "text-[#00d4ff]";
      default:
        return "text-[#8892a6]";
    }
  };

  if (loading) {
    return (
      <div className="pro-card p-6 h-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-[#00d4ff] font-mono">Loading alerts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pro-card p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e2a47]">
        <div>
          <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
            Live Smart Money Alerts
          </h2>
          <p className="text-xs text-[#8892a6] font-mono mt-1">
            Real-time whale movements & anomalies detected on Mantle blockchain
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-xs font-mono text-[#00ff88]">MONITORING</span>
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {anomalies.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-[#8892a6] font-mono text-sm mb-2">No alerts detected</div>
              <div className="text-xs text-[#8892a6]/60 font-mono">Monitoring blockchain...</div>
            </div>
          </div>
        ) : (
          anomalies.map((alert, idx) => (
            <motion.div
              key={alert.id || idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="pro-card-hover p-3 cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                {/* Type Badge */}
                <div className={`w-8 h-8 rounded-sm flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 ${getTypeColor(alert.type)}`}>
                  {getTypeIcon(alert.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-mono font-bold text-white truncate">
                      {alert.type.replace(/_/g, " ")}
                    </span>
                    <span className={`text-xs font-mono font-bold ${getPriorityColor(alert.priority)}`}>
                      {alert.priority}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-[#8892a6] mb-2 truncate">
                    {alert.action}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className="text-[#00d4ff]">
                        ${(alert.amount / 1000).toFixed(1)}K
                      </span>
                      <span className="text-[#8892a6]">{alert.protocol}</span>
                    </div>
                    <span className="text-[#8892a6]">
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-[#1e2a47] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#00d4ff]"
                        initial={{ width: 0 }}
                        animate={{ width: `${alert.confidence * 100}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                      />
                    </div>
                    <span className="text-xs font-mono text-[#00d4ff] tabular-nums">
                      {(alert.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-4 pt-4 border-t border-[#1e2a47] grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-xs font-mono text-[#8892a6] mb-1">CRITICAL</div>
          <div className="text-lg font-mono font-bold text-[#ff4757]">
            {anomalies.filter(a => a.priority === "CRITICAL").length}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-mono text-[#8892a6] mb-1">HIGH</div>
          <div className="text-lg font-mono font-bold text-[#ffa502]">
            {anomalies.filter(a => a.priority === "HIGH").length}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-mono text-[#8892a6] mb-1">AVG CONF</div>
          <div className="text-lg font-mono font-bold text-[#00d4ff]">
            {anomalies.length > 0
              ? Math.round((anomalies.reduce((sum, a) => sum + a.confidence, 0) / anomalies.length) * 100)
              : 0}%
          </div>
        </div>
      </div>
    </div>
  );
}
