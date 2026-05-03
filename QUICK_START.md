# AlphaPulse - Quick Start Guide

Get AlphaPulse running in 5 minutes! ⚡

---

## 1. Get API Keys (2 min)

### Groq API Key (Free)
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up → Create API Key
3. Copy key (starts with `gsk_`)

### Telegram Bot Token (Free)
1. Open Telegram → Message [@BotFather](https://t.me/botfather)
2. Send `/newbot` → Follow instructions
3. Copy bot token

### Supabase (Free)
1. Go to [supabase.com](https://supabase.com)
2. Create project → Copy URL and Anon Key
3. Run SQL from `SETUP.md` Step 2

---

## 2. Configure Backend (1 min)

```bash
cd backend
cp .env.example .env
```

Edit `.env` - add your keys:
```env
GROQ_API_KEY=gsk_your_key_here
TELEGRAM_BOT_TOKEN=your_bot_token_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key_here
```

---

## 3. Install & Run (2 min)

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

---

## 4. Test (30 sec)

1. **Backend:** Open [http://localhost:8000](http://localhost:8000)
   - Should see: `{"status":"ok"}`

2. **Frontend:** Open [http://localhost:3000](http://localhost:3000)
   - Should see dashboard

3. **Telegram:** Send `/start` to your bot
   - Should receive welcome message

---

## Done! 🎉

Your AlphaPulse is now:
- ✅ Monitoring Mantle blockchain
- ✅ Detecting smart money movements
- ✅ Sending Telegram alerts
- ✅ Showing live dashboard

---

## Next Steps

- **Test Alpha Search:** Try `/alpha MNT` in Telegram
- **View Stats:** Check `/stats` command
- **Monitor Dashboard:** Watch alerts appear in real-time
- **Deploy:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for production

---

## Troubleshooting

**Backend won't start?**
- Check all API keys are correct
- Verify Python 3.11+ installed
- Check logs in `backend/logs/`

**Frontend won't load?**
- Ensure backend is running first
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Try `npm run dev` again

**Bot not responding?**
- Verify bot token is correct
- Check backend logs for errors
- Try `/start` command again

---

## Demo Day Ready Checklist

For hackathon presentation:

- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] Telegram bot working
- [ ] At least 10 anomalies detected
- [ ] Accuracy stats showing
- [ ] Demo script prepared
- [ ] Screenshots ready

---

**Need help?** Check [SETUP.md](./SETUP.md) for detailed instructions.

**Ready to deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md).

---

*Built for Turing Test Hackathon 2026 🏆*
