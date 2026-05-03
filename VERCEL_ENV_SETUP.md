# Vercel Environment Variables Setup

## CRITICAL: Frontend не работает без этой переменной!

### **Проблема:**
Фронтенд не может подключиться к бэкенду, потому что не установлена переменная окружения `NEXT_PUBLIC_API_URL`.

### **Решение:**

1. Зайди на https://vercel.com/dashboard
2. Выбери проект `alpha-pulse-hackaton`
3. Settings → Environment Variables
4. Добавь переменную:

```
Name: NEXT_PUBLIC_API_URL
Value: https://alpha-pulse-hackaton-production.up.railway.app
Environment: Production, Preview, Development
```

5. Нажми "Save"
6. Redeploy проект:
   - Deployments → Latest Deployment → ... → Redeploy

### **Проверка:**

После редеплоя открой консоль браузера (F12) и проверь:
- Не должно быть ошибок 404 или CORS
- Запросы должны идти на `https://alpha-pulse-hackaton-production.up.railway.app/api/*`

### **Альтернатива (если не хочешь заходить в Vercel):**

Создай файл `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://alpha-pulse-hackaton-production.up.railway.app
```

И закоммить его (но это не рекомендуется для production).

---

## Текущий статус:

- ✅ Backend: https://alpha-pulse-hackaton-production.up.railway.app
- ⚠️ Frontend: Нужно установить NEXT_PUBLIC_API_URL
- ✅ Contracts: Deployed на Mantle Mainnet

---

## После установки переменной:

Все компоненты заработают:
- ✅ Stats Panel
- ✅ Mantle Stats
- ✅ AI Multi-Agent System
- ✅ Copy Trading Dashboard
- ✅ AI Predictions
- ✅ Live Alerts
- ✅ Prediction History
