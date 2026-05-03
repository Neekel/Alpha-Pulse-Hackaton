# 🚨 QUICK FIX - Пустые поля на фронтенде

## Проблема:
Все поля пустые, потому что:
1. ❌ Backend упал (502 error)
2. ❌ Frontend не знает URL бэкенда

## Решение (2 шага):

### **ШАГ 1: Временно используй упрощенный бэкенд**

В Railway:
1. Settings → Deploy
2. Найди "Start Command"
3. Измени на: `cd backend && python main_simple.py`
4. Redeploy

Или в `backend/main.py` временно закомментируй проблемные импорты:
```python
# from ai_agents import OrchestratorAgent  # ← закомментируй
# from copy_trading import CopyTradingSystem  # ← закомментируй
```

### **ШАГ 2: Установи переменную окружения в Vercel**

1. Зайди на https://vercel.com/dashboard
2. Выбери проект
3. Settings → Environment Variables
4. Добавь:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://alpha-pulse-hackaton-production.up.railway.app`
   - Environment: Production, Preview, Development
5. Save
6. Redeploy

---

## Альтернатива (быстрая):

Создай `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://alpha-pulse-hackaton-production.up.railway.app
```

И запусти локально:
```bash
cd frontend
npm run dev
```

---

## Проверка:

После исправлений:
1. Backend: https://alpha-pulse-hackaton-production.up.railway.app/ должен вернуть JSON
2. Frontend: Открой консоль (F12), не должно быть ошибок 404

---

## Что сломалось:

Новые модули `ai_agents.py` и `copy_trading.py` используют синхронные Groq API вызовы внутри async функций, что вызывает проблемы.

**Временное решение**: Используй `main_simple.py` с mock данными
**Долгосрочное решение**: Переписать AI агенты с правильным async/await

---

## Статус:

- ✅ `main_simple.py` создан - работает с mock данными
- ✅ `VERCEL_ENV_SETUP.md` создан - инструкция по настройке
- ⚠️ Нужно: Переключить Railway на `main_simple.py`
- ⚠️ Нужно: Установить `NEXT_PUBLIC_API_URL` в Vercel

После этого все заработает!
