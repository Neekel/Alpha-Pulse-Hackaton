"use client";

import { motion } from "framer-motion";

export function ContractInfo() {
  const contracts = [
    {
      name: "PredictionRegistry",
      address: "0x9698c4AA501B4C9Fad61b686Ae391c1d325bc91F",
      description: "On-chain prediction verification",
      icon: "📝",
    },
    {
      name: "AnomalyRewards",
      address: "0x5ecB830af46E0D48A0d652bc5F97B6f239396571",
      description: "User staking & rewards",
      icon: "💰",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-6 mb-12"
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xl">⚡</span>
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-white">Smart Contracts Deployed</h3>
          <p className="text-sm text-gray-400">Verified on Mantle Sepolia Testnet</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {contracts.map((contract, i) => (
          <motion.a
            key={contract.name}
            href={`https://sepolia.mantlescan.xyz/address/${contract.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/50 transition-all group"
            whileHover={{ y: -5, scale: 1.02 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{contract.icon}</span>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                  {contract.name}
                </h4>
                <p className="text-xs text-gray-400 mb-2">{contract.description}</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-purple-300 bg-purple-900/30 px-2 py-1 rounded">
                    {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                  </code>
                  <span className="text-xs text-gray-500 group-hover:text-purple-400 transition-colors">
                    View on Explorer →
                  </span>
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      <motion.div
        className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span>All predictions verified on-chain • 100% transparent</span>
      </motion.div>
    </motion.div>
  );
}
