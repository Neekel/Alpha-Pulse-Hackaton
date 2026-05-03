# AlphaPulse - Deployed Contract Addresses

## Mantle Sepolia Testnet (Chain ID: 5003)

**Deployment Date:** May 3, 2026  
**Deployer:** `0x15Ec03bC350D0b37bBEcFc5B4b22907f1A5A47c1`

### Contract Addresses

| Contract | Address | Explorer |
|----------|---------|----------|
| **PredictionRegistry** | `0x9698c4AA501B4C9Fad61b686Ae391c1d325bc91F` | [View on Explorer](https://sepolia.mantlescan.xyz/address/0x9698c4AA501B4C9Fad61b686Ae391c1d325bc91F) |
| **AnomalyRewards** | `0x5ecB830af46E0D48A0d652bc5F97B6f239396571` | [View on Explorer](https://sepolia.mantlescan.xyz/address/0x5ecB830af46E0D48A0d652bc5F97B6f239396571) |

---

## Contract Descriptions

### PredictionRegistry
**Purpose:** On-chain registry for verifiable AlphaPulse predictions

**Key Features:**
- Stores prediction hashes with timestamps
- Verifies predictions after 24 hours
- Tracks accuracy statistics on-chain
- Provides public accuracy metrics

**Main Functions:**
- `registerPrediction()` - Register new prediction hash
- `verifyPrediction()` - Verify prediction after 24h
- `getPrediction()` - Get prediction details
- `getAccuracy()` - Get accuracy statistics

### AnomalyRewards
**Purpose:** Reward users who follow correct AlphaPulse signals

**Key Features:**
- Users stake MNT on predictions
- Correct predictions earn 10% bonus
- Incorrect predictions lose stake
- Minimum stake: 0.01 MNT

**Main Functions:**
- `createSignal()` - Create new signal for staking
- `stake()` - Stake MNT on a signal
- `resolveSignal()` - Resolve signal after verification
- `claimReward()` - Claim rewards for correct predictions

---

## Integration

### Backend (.env)
```env
PREDICTION_REGISTRY_ADDRESS=0x9698c4AA501B4C9Fad61b686Ae391c1d325bc91F
ANOMALY_REWARDS_ADDRESS=0x5ecB830af46E0D48A0d652bc5F97B6f239396571
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_PREDICTION_REGISTRY=0x9698c4AA501B4C9Fad61b686Ae391c1d325bc91F
NEXT_PUBLIC_ANOMALY_REWARDS=0x5ecB830af46E0D48A0d652bc5F97B6f239396571
```

---

## Verification

To verify contracts on Mantle Explorer:

```bash
npx hardhat verify --network mantleTestnet 0x9698c4AA501B4C9Fad61b686Ae391c1d325bc91F
npx hardhat verify --network mantleTestnet 0x5ecB830af46E0D48A0d652bc5F97B6f239396571
```

---

## Usage Example

### Register Prediction (Backend)
```javascript
const predictionHash = ethers.keccak256(
  ethers.toUtf8Bytes(JSON.stringify(predictionData))
);

const tx = await predictionRegistry.registerPrediction(
  predictionHash,
  "WHALE_BUY",
  "MNT",
  JSON.stringify(metadata)
);

await tx.wait();
```

### Stake on Signal (Frontend)
```javascript
const tx = await anomalyRewards.stake(signalId, {
  value: ethers.parseEther("0.1") // 0.1 MNT
});

await tx.wait();
```

---

## Network Info

- **RPC URL:** https://rpc.sepolia.mantle.xyz
- **Chain ID:** 5003
- **Explorer:** https://sepolia.mantlescan.xyz
- **Faucet:** https://faucet.sepolia.mantle.xyz

---

## Security

- Both contracts use OpenZeppelin libraries
- ReentrancyGuard protection on all payable functions
- Ownable pattern for admin functions
- 24-hour verification delay enforced

---

**Status:** ✅ Deployed and Ready for Integration
