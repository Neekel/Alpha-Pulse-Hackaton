# AlphaPulse

Smart Money AI Anomaly Detector on the Mantle Network

“The whales never sleep. Now you know what they're doing—10 minutes before the market reacts.”

Built for Turing Test Hackathon 2026 by Mantle Network.

---

## 🎯 Overview

AlphaPulse monitors Mantle blockchain in real-time, detects whale movements and anomalous patterns, and sends AI-explained alerts to Telegram. All predictions are verifiable on-chain.

### Key Features
- 🐋 **Smart Money Detection:** Real-time whale tracking on Mantle
- 🤖 **AI Explanations:** Groq LLM translates on-chain data to human language
- ✅ **Verifiable Predictions:** On-chain hash of predictions for transparency
- 📱 **Telegram Alerts:** Instant notifications with actionable insights
- 📊 **Web Dashboard:** Track accuracy and historical signals

---

## 🏗️ Architecture

### Tech Stack
- **Backend:** Python 3.11, FastAPI, web3.py, Groq API
- **Bot:** python-telegram-bot
- **Frontend:** Next.js 16, TypeScript, Tailwind CSS v4
- **Smart Contracts:** Solidity 0.8.25, Hardhat, OpenZeppelin
- **Database:** Supabase (PostgreSQL + Realtime)
- **Blockchain:** Mantle Mainnet (Chain ID: 5000) ✅
- **Deploy:** Railway (backend) + Vercel (frontend)

### Anomaly Detectors
| Type | Condition | Threshold | Priority |
|------|-----------|-----------|----------|
| 🐋 WHALE_BUY | Single wallet purchase | >$50K in <1h | CRITICAL |
| 🔴 LIQUIDITY_EXIT | LP token withdrawal | >20% of pool | CRITICAL |
| 🎯 SMART_CLUSTER | Synchronized buys | 5+ wallets, <10min | HIGH |
| 🚀 MOMENTUM_BUILD | Volume spike | >3σ from 7-day avg | MEDIUM |

### Smart Contracts (Mantle Mainnet) ✅ VERIFIED
- **PredictionRegistry:** `0x4597f29db1FBFAbfCEdDb3E9dEF7cfD584dbA090`
  - On-chain prediction verification
  - Accuracy tracking
  - Timestamped proofs
  - ✅ [Verified on Mantlescan](https://mantlescan.xyz/address/0x4597f29db1FBFAbfCEdDb3E9dEF7cfD584dbA090#code)
  
- **AnomalyRewards:** `0xCD71e0A3dB3d31e81c1f0961e6B8E58e863A6119`
  - User staking on signals
  - Rewards distribution
  - ✅ [Verified on Mantlescan](https://mantlescan.xyz/address/0xCD71e0A3dB3d31e81c1f0961e6B8E58e863A6119#code)

### Testnet Contracts (Backup)
- **PredictionRegistry:** `0x9698c4AA501B4C9Fad61b686Ae391c1d325bc91F` (Sepolia)
- **AnomalyRewards:** `0x5ecB830af46E0D48A0d652bc5F97B6f239396571` (Sepolia)
  - Reward distribution
  - 10% bonus for correct predictions

Explorer: [View on Mantlescan](https://sepolia.mantlescan.xyz)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Telegram Bot Token
- Groq API Key
- Supabase Account

### Installation

```bash
# Clone repository
cd AlphaPulse

# Install Python dependencies
cd backend
pip install -r requirements.txt

# Install Node dependencies
cd ../frontend
npm install

# Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### Run Development

```bash
# Terminal 1 - Backend + Bot
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 📋 Environment Variables

### Backend (.env)
```env
MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
GROQ_API_KEY=your_groq_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🤖 Telegram Bot Commands

- `/start` - Start receiving alerts
- `/stop` - Stop alerts
- `/alpha <token>` - Get smart money activity for token
- `/stats` - View accuracy statistics
- `/follow <signal_id>` - Paper trade a signal
- `/portfolio` - View paper trading P&L

---

## 📊 Killer Feature: Verifiable Predictions

1. Agent detects anomaly
2. Prediction hash stored on-chain
3. After 24h, accuracy automatically verified
4. Judges can verify on Mantle Explorer during Demo Day

---

## 🎮 How It Works

1. **Monitor:** AlphaPulse watches Mantle RPC for unusual patterns
2. **Detect:** Anomaly engine flags whale movements
3. **Explain:** Groq AI translates data to human insights
4. **Verify:** Prediction hash written on-chain
5. **Alert:** Telegram notification sent to subscribers
6. **Track:** Accuracy measured after 24h

---

## 🏆 Hackathon Submission

**Turing Test Hackathon 2026 by Mantle Network**

- **Track:** AI Alpha & Data + Verifiable Intelligence
- **Prize Pool:** $100,000
- **Deadline:** June 15, 2026
- **Network:** Mantle Sepolia Testnet

### Requirements Met
✅ **Deployed on Mantle Network** - Smart contracts live on Mantle Sepolia  
✅ Real-time Mantle RPC monitoring  
✅ AI-powered insights (Groq API)  
✅ On-chain verifiable predictions (PredictionRegistry)  
✅ Measurable accuracy metrics (tracked on-chain)  
✅ Production-ready Telegram bot  
✅ User rewards system (AnomalyRewards contract)  

---

## 📝 Project Structure

```
AlphaPulse/
├── backend/              # Python FastAPI + Bot
│   ├── main.py          # FastAPI server
│   ├── bot.py           # Telegram bot
│   ├── monitor.py       # Blockchain monitor
│   ├── detectors.py     # Anomaly detectors
│   ├── ai_explainer.py  # Groq AI integration
│   └── requirements.txt
├── frontend/            # Next.js dashboard
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── package.json
└── README.md
```

---

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [API Documentation](./API.md) - Backend API reference
- [Bot Commands](./BOT.md) - Telegram bot guide

---

## 🛠️ Development Roadmap

### Week 1-2: Core
- [x] Mantle RPC connection
- [x] Anomaly detectors (4 types)
- [x] Groq AI explainer
- [x] Supabase integration
- [x] Telegram bot MVP

### Week 3-4: WOW
- [ ] On-chain prediction verification
- [ ] Web dashboard with accuracy tracker
- [ ] Paper trading mode
- [ ] DEX-specific monitoring (Merchant Moe, Agni Finance)
- [ ] Alpha Score for tokens

---

## 📞 Support

- GitHub Issues: [Create an issue]
- Documentation: See `/docs` folder
- Telegram: [@AlphaPulseBot]

---

**Built with ❤️ for Turing Test Hackathon 2026**

*"AlphaPulse doesn't just detect anomalies. It proves its predictions — on-chain, verifiable, timestamped."*
