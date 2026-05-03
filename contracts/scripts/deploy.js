const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying AlphaPulse contracts to Mantle Network...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MNT\n");

  // Deploy PredictionRegistry
  console.log("📝 Deploying PredictionRegistry...");
  const PredictionRegistry = await hre.ethers.getContractFactory("PredictionRegistry");
  const predictionRegistry = await PredictionRegistry.deploy();
  await predictionRegistry.waitForDeployment();
  const predictionRegistryAddress = await predictionRegistry.getAddress();
  console.log("✅ PredictionRegistry deployed to:", predictionRegistryAddress);

  // Deploy AnomalyRewards
  console.log("\n💰 Deploying AnomalyRewards...");
  const AnomalyRewards = await hre.ethers.getContractFactory("AnomalyRewards");
  const anomalyRewards = await AnomalyRewards.deploy();
  await anomalyRewards.waitForDeployment();
  const anomalyRewardsAddress = await anomalyRewards.getAddress();
  console.log("✅ AnomalyRewards deployed to:", anomalyRewardsAddress);

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      PredictionRegistry: predictionRegistryAddress,
      AnomalyRewards: anomalyRewardsAddress,
    },
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = `${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Also save as latest
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}-latest.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📄 Deployment info saved to:", filename);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log("-------------------");
  console.log("PredictionRegistry:", predictionRegistryAddress);
  console.log("AnomalyRewards:    ", anomalyRewardsAddress);
  console.log("\nNetwork:", hre.network.name);
  console.log("Chain ID:", deploymentInfo.chainId);
  console.log("Deployer:", deployer.address);
  console.log("\nExplorer URLs:");
  console.log("-------------------");
  
  const explorerBase = hre.network.name === "mantleTestnet" 
    ? "https://sepolia.mantlescan.xyz"
    : "https://mantlescan.xyz";
  
  console.log("PredictionRegistry:", `${explorerBase}/address/${predictionRegistryAddress}`);
  console.log("AnomalyRewards:    ", `${explorerBase}/address/${anomalyRewardsAddress}`);
  
  console.log("\n" + "=".repeat(60));
  console.log("\n✨ Next steps:");
  console.log("1. Update backend/.env with contract addresses");
  console.log("2. Update frontend/.env.local with contract addresses");
  console.log("3. Verify contracts (optional):");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${predictionRegistryAddress}`);
  console.log(`   npx hardhat verify --network ${hre.network.name} ${anomalyRewardsAddress}`);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
