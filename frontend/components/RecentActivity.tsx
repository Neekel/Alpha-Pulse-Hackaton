"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
  anomalies: any[];
}

export function RecentActivity({ anomalies }: RecentActivityProps) {
  if (anomalies.length === 0) return null;

  const emojiMap: Record<string, string> = {
    WHALE_BUY: "🐋",
    LIQUIDITY_EXIT: "🔴",
    SMART_CLUSTER: "🎯",
    MOMENTUM_BUILD: "🚀",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <motion.span
          className="text-2xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⚡
        </motion.span>
        Recent Activity
      </h3>

      <div className="space-y-3">
        {anomalies.map((anomaly, index) => (
          <motion.div
            key={anomaly.id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-900/50 rounded-lg p-3 hover:bg-gray-900/70 transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">{emojiMap[anomaly.type] || "🔔"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white truncate">
                    {anomaly.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatDistanceToNow(new Date(anomaly.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {anomaly.protocol} • ${anomaly.amount.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${anomaly.confidence * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    />
                  </div>
                  <span className="text-xs text-purple-400 font-semibold whitespace-nowrap">
                    {(anomaly.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-4 text-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-semibold">
          View All Activity →
        </button>
      </motion.div>
    </motion.div>
  );
}
