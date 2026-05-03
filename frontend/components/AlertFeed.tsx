"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Anomaly {
  id: string;
  type: string;
  priority: string;
  confidence: number;
  wallet: string;
  protocol: string;
  action: string;
  amount: number;
  tx_hash: string;
  timestamp: string;
  explanation: string;
}

interface AlertFeedProps {
  anomalies: Anomaly[];
  loading: boolean;
}

export function AlertFeed({ anomalies, loading }: AlertFeedProps) {
  const emojiMap: Record<string, string> = {
    WHALE_BUY: "🐋",
    LIQUIDITY_EXIT: "🔴",
    SMART_CLUSTER: "🎯",
    MOMENTUM_BUILD: "🚀",
  };

  const priorityColors: Record<string, string> = {
    CRITICAL: "border-red-500 bg-red-500/10",
    HIGH: "border-orange-500 bg-orange-500/10",
    MEDIUM: "border-yellow-500 bg-yellow-500/10",
    LOW: "border-blue-500 bg-blue-500/10",
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10 animate-gradient pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <motion.span
              className="w-3 h-3 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-glow">Live Smart Money Alerts</span>
          </h3>
          <motion.div
            className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-sm font-semibold text-purple-300">
              {anomalies.length} Signals
            </span>
          </motion.div>
        </div>

        <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
          {anomalies.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔍
              </motion.div>
              <p className="text-lg text-gray-400">
                Monitoring blockchain for smart money movements...
              </p>
              <motion.div
                className="mt-4 flex justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          ) : (
            anomalies.map((anomaly, index) => (
              <motion.div
                key={anomaly.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className={`border-l-4 ${
                  priorityColors[anomaly.priority] || priorityColors.MEDIUM
                } rounded-lg p-5 hover:shadow-xl transition-all cursor-pointer relative group overflow-hidden`}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <motion.span
                        className="text-3xl"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                      >
                        {emojiMap[anomaly.type] || "🔔"}
                      </motion.span>
                      <div>
                        <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                          {anomaly.type.replace(/_/g, " ")}
                        </h4>
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                          <span>{anomaly.protocol}</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(anomaly.timestamp), {
                              addSuffix: true,
                            })}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <motion.div
                        className="text-sm font-semibold text-purple-400 mb-1"
                        whileHover={{ scale: 1.1 }}
                      >
                        {(anomaly.confidence * 100).toFixed(0)}% confidence
                      </motion.div>
                      <div className="text-xs text-gray-500 uppercase px-2 py-1 bg-gray-900/50 rounded">
                        {anomaly.priority}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-white font-medium mb-2">{anomaly.action}</p>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      <span>Wallet:</span>
                      <code className="bg-gray-900/50 px-2 py-1 rounded text-purple-300">
                        {anomaly.wallet.slice(0, 10)}...{anomaly.wallet.slice(-8)}
                      </code>
                    </p>
                  </div>

                  {anomaly.explanation && (
                    <motion.div
                      className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-purple-500/20"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ delay: index * 0.05 + 0.2 }}
                    >
                      <p className="text-sm text-gray-300 leading-relaxed">
                        <span className="text-purple-400 font-semibold">🧠 AI Insight:</span>{" "}
                        {anomaly.explanation}
                      </p>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between">
                    <motion.div
                      className="text-xl font-bold text-green-400"
                      whileHover={{ scale: 1.1 }}
                    >
                      ${anomaly.amount.toLocaleString()}
                    </motion.div>
                    <motion.a
                      href={`https://sepolia.mantlescan.xyz/tx/${anomaly.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2 group/link"
                      whileHover={{ x: 5 }}
                    >
                      <span>View on Explorer</span>
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
