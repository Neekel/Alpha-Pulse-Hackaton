"use client";

import { motion } from "framer-motion";

export function ContractInfo() {
  const contracts = [
    {
      name: "PredictionRegistry",
      address: "0x4597f29db1FBFAbfCEdDb3E9dEF7cfD584dbA090",
      description: "On-chain prediction verification. Owner-only registration.",
      label: "REGISTRY",
    },
    {
      name: "AnomalyRewards",
      address: "0xCD71e0A3dB3d31e81c1f0961e6B8E58e863A6119",
      description: "User staking & rewards distribution (coming soon).",
      label: "REWARDS",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="pro-card p-6"
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e2a47]">
        <div>
          <h3 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
            Smart Contracts
          </h3>
          <p className="text-xs text-[#8892a6] font-mono mt-1">
            On-chain verification & transparency • Deployed on Mantle Mainnet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00ff88] rounded-full" />
          <span className="text-xs font-mono text-[#00ff88]">VERIFIED</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {contracts.map((contract, i) => (
          <motion.a
            key={contract.name}
            href={`https://mantlescan.xyz/address/${contract.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pro-card-hover p-4 group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#00d4ff] rounded-sm flex items-center justify-center font-mono text-xs font-bold text-[#0a0e27] flex-shrink-0">
                {contract.label.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-mono font-bold text-white mb-1 group-hover:text-[#00d4ff] transition-colors">
                  {contract.name}
                </h4>
                <p className="text-xs text-[#8892a6] font-mono mb-3">{contract.description}</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-[#00d4ff] bg-[#1e2a47] px-2 py-1 rounded-sm font-mono">
                    {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                  </code>
                  <span className="text-xs text-[#8892a6] group-hover:text-[#00d4ff] transition-colors font-mono">
                    →
                  </span>
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}
