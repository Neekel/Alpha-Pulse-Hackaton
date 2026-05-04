# Frontend Blocks Explained

## ✅ Что изменено:

### 1. **StatsPanel** (Total Predictions, Verified, Correct, Accuracy)
- **Было:** `p-6` padding
- **Стало:** `p-4` padding, уменьшен размер шрифта labels
- **Экономия:** ~30% высоты

### 2. **MantleStats** (TVL, Daily TX, Active 24h, TPS, Block, Gas)
- **Было:** 2 ряда по 3 метрики (`grid-cols-3`)
- **Стало:** 1 ряд из 6 метрик (`grid-cols-6`)
- **Экономия:** ~40% высоты

---

## 📋 Описания блоков:

### 3. **Smart Contracts**
**Для чего:** On-chain verification & transparency
- **PredictionRegistry:** Хранит все предсказания on-chain для прозрачности
- **AnomalyRewards:** Будущая система стейкинга и наград (coming soon)
- **Зачем:** Доказать жюри, что проект использует blockchain, а не просто API

### 4. **AI Multi-Agent System**
**Как работает:**
1. 4 AI агента анализируют разные аспекты:
   - **WhaleAgent:** Отслеживает крупные кошельки
   - **DEXAgent:** Анализирует DEX активность
   - **RiskAgent:** Оценивает риски
   - **SentimentAgent:** Анализирует настроения
2. **OrchestratorAgent** собирает все данные и генерирует финальную рекомендацию
3. Кнопка **"Run Analysis"** запускает анализ вручную
4. Powered by **Groq LLM** (llama-3.3-70b-versatile)

### 5. **Copy Trading Leaderboard**
**Как работает:**
1. Отслеживаем топ-трейдеров по профиту
2. Показываем их стратегии (Whale Follower, Smart Money, etc.)
3. Пользователи могут копировать их сделки автоматически
4. **Сейчас:** Mock данные для демо
5. **В будущем:** Реальные данные из blockchain + автоматическое копирование

### 6. **AI Market Intelligence**
**Как работает:**
1. Анализирует on-chain данные (whale movements, DEX volume, gas price)
2. AI генерирует предсказания на 3 таймфрейма: 1H, 6H, 24H
3. Показывает направление (BULLISH/BEARISH), confidence, price target
4. Обновляется в реальном времени
5. **Факторы:** Whale Activity, Gas Price, DEX Volume

### 7. **Live Smart Money Alerts**
**Как работает:**
1. **Blockchain Monitor** сканирует Mantle Network в реальном времени
2. Детектирует аномалии:
   - WHALE_BUY: Крупные покупки (>$50K)
   - LIQUIDITY_EXIT: Выход ликвидности
   - SMART_CLUSTER: Кластер умных кошельков
   - MOMENTUM_BUILD: Нарастание momentum
3. **Сейчас:** Частично mock (т.к. мало транзакций на Mantle)
4. **В production:** 100% реальные данные из blockchain

### 8. **Prediction History**
**Отличие от первого блока:**
- **StatsPanel (вверху):** Краткая статистика (4 цифры)
- **Prediction History (внизу):** Детальная история каждого предсказания
  - Timestamp
  - Type (WHALE_BUY, etc.)
  - Prediction details
  - Verification status
  - Outcome (correct/incorrect)
  - Фильтры по типам

---

## 🎯 Итого:

✅ **Уменьшена высота:** StatsPanel (-30%), MantleStats (-40%)
✅ **Добавлены описания:** Теперь понятно, что делает каждый блок
✅ **Сохранен дизайн:** Красивый Bloomberg Terminal style
✅ **Больше информативности:** Пользователь понимает, как работает система

---

## 📊 Структура данных:

- **Real-time:** Blockchain Monitor → Anomalies → Alerts
- **AI Analysis:** On-chain data → AI Agents → Predictions
- **Copy Trading:** Top traders → Strategies → Leaderboard
- **Verification:** Predictions → Smart Contracts → History
