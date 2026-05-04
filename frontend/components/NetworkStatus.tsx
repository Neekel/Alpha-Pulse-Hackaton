"use client";

import { motion } from "framer-motion";

export function NetworkStatus() {
  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-2 bg-[#141b2d] border border-[#00ff88]/30 rounded-sm"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div
        className="w-2 h-2 bg-[#00ff88] rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div className="text-xs font-mono">
        <div className="text-[#00ff88] font-bold">Mantle Mainnet</div>
        <div className="text-[#8892a6]">Chain ID: 5000</div>
      </div>
    </motion.div>
  );
}
