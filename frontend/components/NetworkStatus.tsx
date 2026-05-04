"use client";

import { motion } from "framer-motion";

export function NetworkStatus() {
  return (
    <motion.div
      className="flex items-center gap-2 px-2 py-1.5 bg-[#141b2d] border border-[#00ff88]/30 rounded-sm"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div
        className="w-1.5 h-1.5 bg-[#00ff88] rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div className="text-[10px] font-mono">
        <span className="text-[#00ff88] font-bold">Mantle</span>
        <span className="text-[#8892a6] ml-1.5">5000</span>
      </div>
    </motion.div>
  );
}
