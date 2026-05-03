"use client";

import { motion } from "framer-motion";

export function NetworkStatus() {
  return (
    <motion.div
      className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-green-500/30 rounded-lg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div
        className="w-2 h-2 bg-green-400 rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div className="text-sm">
        <div className="text-green-400 font-semibold">Mantle Sepolia</div>
        <div className="text-xs text-gray-400">Chain ID: 5003</div>
      </div>
    </motion.div>
  );
}
