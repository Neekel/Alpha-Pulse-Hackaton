# 🚀 AlphaPulse - AI Smart Money Detector

## Для Turing Test Hackathon 2026

---

## 🎯 ЧТО ЭТО

**AlphaPulse** - AI-powered платформа для детекции движений "умных денег" на Mantle Network.

### **Killer Features:**

1. **🤖 AI Multi-Agent System** - 4 специализированных AI агента работают параллельно
2. **💰 Copy Trading** - копируй стратегии успешных трейдеров
3. **🎨 Mantle Branding** - глубокая интеграция с Mantle Network

---

## 🚀 БЫСТРЫЙ СТАРТ

### **Deployed URLs:**
- **Frontend**: https://alpha-pulse-hackaton.vercel.app
- **Backend**: https://alpha-pulse-hackaton-production.up.railway.app
- **Telegram Bot**: https://t.me/AlphaPulseBot

### **Smart Contracts (Mantle Mainnet):**
- **PredictionRegistry**: `0x4597f29db1FBFAbfCEdDb3E9dEF7cfD584dbA090`
- **AnomalyRewards**: `0xCD71e0A3dB3d31e81c1f0961e6B8E58e863A6119`

---

## 🤖 AI MULTI-AGENT SYSTEM

### **Как работает:**

```
1. Нажимаешь "Run Analysis"
2. 4 AI агента анализируют данные параллельно:
   - Whale Agent → анализ китов
   - DEX Agent → анализ ликвидности
   - Risk Agent → оценка рисков
   - Sentiment Agent → настроения рынка
3. Orchestrator синтезирует их выводы
4. Получаешь финальную рекомендацию: BUY/SELL/HOLD/WAIT
```

### **Почему это круто:**
- ✅ Не один AI, а целая система
- ✅ Каждый агент - эксперт в своей области
- ✅ Финальное решение основано на консенсусе
- ✅ Powered by Groq LLM (llama-3.3-70b)

---

## 💰 COPY TRADING

### **Как работает:**

```
1. Смотришь leaderboard топ-трейдеров
2. Кликаешь на трейдера
3. AI анализирует его стратегию
4. Видишь все его сделки с P&L
5. Копируешь его стратегию (coming soon)
```

### **Метрики трейдеров:**
- **Profit** - общий профит
- **Win Rate** - процент успешных сделок
- **Strategy** - тип стратегии (определяется AI)
- **Trades** - количество сделок
- **Volume** - общий объем

### **AI Strategy Analysis:**
- Тип стратегии (Whale Follower, Smart Money, etc)
- Risk profile (LOW/MEDIUM/HIGH)
- Сильные стороны
- Кому подходит
- Copy risk level

---

## 🎨 MANTLE BRANDING

### **Что показываем:**
- **TVL** - Total Value Locked в Mantle
- **TPS** - Transactions Per Second
- **Daily Transactions** - транзакций за 24h
- **Active Addresses** - активных адресов
- **Gas Price** - текущая цена газа
- **Block Number** - текущий блок

### **Интеграция:**
- Логотип Mantle
- "Powered by Mantle Network" badge
- Ссылки на экосистему
- Фирменные цвета

---

## 📊 АРХИТЕКТУРА

### **Backend (Python/FastAPI):**
```
backend/
├── main.py              # API endpoints
├── ai_agents.py         # Multi-agent system
├── copy_trading.py      # Copy trading logic
├── monitor.py           # Blockchain monitoring
├── detectors.py         # Anomaly detection
├── ai_explainer.py      # AI explanations
└── bot.py               # Telegram bot
```

### **Frontend (Next.js/React):**
```
frontend/
├── app/
│   ├── page.tsx         # Main page
│   └── globals.css      # Professional styling
└── components/
    ├── AIAgentDashboard.tsx      # Multi-agent UI
    ├── CopyTradingDashboard.tsx  # Copy trading UI
    ├── MantleStats.tsx           # Mantle stats
    ├── AIPredictionsPro.tsx      # AI predictions
    ├── AlertFeedCompact.tsx      # Live alerts
    └── PredictionHistory.tsx     # History table
```

### **Smart Contracts (Solidity):**
```
contracts/
├── PredictionRegistry.sol  # On-chain predictions
└── AnomalyRewards.sol      # Rewards system
```

---

## 🔧 ЛОКАЛЬНАЯ РАЗРАБОТКА

### **Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### **Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### **Environment Variables:**
```bash
# Backend (.env)
MANTLE_RPC_URL=https://rpc.mantle.xyz
GROQ_API_KEY=your_groq_key
TELEGRAM_BOT_TOKEN=your_bot_token
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🎯 DEMO SCRIPT

### **1. Главная страница (10 сек)**
- "Профессиональный Bloomberg Terminal дизайн"
- "Все работает в реальном времени"

### **2. AI Multi-Agent System (30 сек)**
- Нажать "Run Analysis"
- Показать работу 4 агентов
- Показать финальную рекомендацию
- "Это не просто один LLM call - это система"

### **3. Copy Trading (30 сек)**
- Показать leaderboard
- Кликнуть на топ-трейдера
- Показать AI анализ стратегии
- Показать его сделки с P&L

### **4. Mantle Integration (20 сек)**
- Показать Mantle Stats
- Показать smart contracts
- "Все predictions on-chain"

### **5. Business Model (10 сек)**
- "Subscription model"
- "Copy trading commissions"
- "Profitable from day 1"

**Total: 100 секунд = идеально для питча!**

---

## 💡 ТЕХНОЛОГИИ

### **AI & ML:**
- Groq LLM (llama-3.3-70b-versatile)
- Multi-agent architecture
- Real-time analysis

### **Blockchain:**
- Mantle Network (Mainnet)
- Web3.py
- Smart Contracts (Solidity)

### **Backend:**
- Python 3.11
- FastAPI
- Supabase (PostgreSQL)
- Telegram Bot API

### **Frontend:**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion

### **Deployment:**
- Vercel (Frontend)
- Railway (Backend)
- GitHub Actions (CI/CD)

---

## 🏆 ПОЧЕМУ МЫ ПОБЕДИМ

### **1. Уникальность**
- Multi-agent AI system (никто так не делает)
- Copy trading с AI анализом
- On-chain verification

### **2. Реальная ценность**
- Люди хотят копировать успешных трейдеров
- AI объясняет "почему", а не просто "что"
- Profitable business model

### **3. Профессионализм**
- Bloomberg Terminal дизайн
- Чистый код
- Полная документация
- Production ready

### **4. Mantle Integration**
- Глубокая интеграция
- Брендинг
- Smart contracts на Mainnet
- Показываем ценность для экосистемы

---

## 📞 КОНТАКТЫ

- **GitHub**: https://github.com/Neekel/Alpha-Pulse-Hackaton
- **Telegram Bot**: https://t.me/AlphaPulseBot
- **Frontend**: https://alpha-pulse-hackaton.vercel.app
- **Backend**: https://alpha-pulse-hackaton-production.up.railway.app

---

## 📄 ЛИЦЕНЗИЯ

MIT License - свободно используй, модифицируй, деплой!

---

## 🎉 ГОТОВЫ К ПОБЕДЕ!

**Deadline**: June 15, 2026
**Prize Pool**: $100K
**Our Confidence**: 95% 🚀

**LET'S WIN THIS! 🏆**
