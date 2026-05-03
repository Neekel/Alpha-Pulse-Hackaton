"""Telegram bot for AlphaPulse alerts"""
import asyncio
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    ContextTypes,
    MessageHandler,
    filters
)
from loguru import logger
from typing import Dict, Any, List
from detectors import Anomaly
from datetime import datetime


class AlphaPulseBot:
    def __init__(self, token: str, ai_explainer, supabase_client):
        self.token = token
        self.ai_explainer = ai_explainer
        self.supabase = supabase_client
        self.app = None
        self.subscribers: set = set()
        self.paper_trades: Dict[int, List[Dict]] = {}  # user_id -> trades
    
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command"""
        user_id = update.effective_user.id
        self.subscribers.add(user_id)
        
        welcome_message = """🚀 **Welcome to AlphaPulse!**

I monitor Mantle Network 24/7 and alert you when smart money moves.

**Commands:**
/start - Start receiving alerts
/stop - Stop alerts
/alpha <token> - Get smart money activity for token
/stats - View accuracy statistics
/follow <signal_id> - Paper trade a signal
/portfolio - View your paper trading P&L
/help - Show this message

**Alert Types:**
🐋 WHALE_BUY - Large purchases (>$50K)
🔴 LIQUIDITY_EXIT - LP withdrawals (>20%)
🎯 SMART_CLUSTER - Coordinated buying
🚀 MOMENTUM_BUILD - Volume spikes

All predictions are verifiable on-chain. Let's find alpha together! 💎
"""
        
        await update.message.reply_text(
            welcome_message,
            parse_mode='Markdown'
        )
        
        logger.info(f"User {user_id} subscribed")
    
    async def stop_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /stop command"""
        user_id = update.effective_user.id
        if user_id in self.subscribers:
            self.subscribers.remove(user_id)
        
        await update.message.reply_text(
            "❌ Alerts stopped. Use /start to resume.",
            parse_mode='Markdown'
        )
        
        logger.info(f"User {user_id} unsubscribed")
    
    async def alpha_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /alpha <token> command"""
        if not context.args:
            await update.message.reply_text(
                "Usage: /alpha <token>\nExample: /alpha MNT",
                parse_mode='Markdown'
            )
            return
        
        token = context.args[0].upper()
        
        await update.message.reply_text(
            f"🔍 Analyzing smart money activity for **{token}**...",
            parse_mode='Markdown'
        )
        
        try:
            # Fetch anomalies for this token from database
            response = self.supabase.table('anomalies') \
                .select('*') \
                .eq('token', token) \
                .order('timestamp', desc=True) \
                .limit(10) \
                .execute()
            
            anomalies = response.data if response.data else []
            
            # Get price data (simplified - use real oracle in production)
            price_data = {
                'current': 0.50,
                'change_24h': 2.5,
                'volume_24h': 1250000
            }
            
            # Generate AI report
            report = self.ai_explainer.generate_alpha_report(
                token,
                anomalies,
                price_data
            )
            
            message = f"""📊 **Alpha Report: {token}**

{report}

**Recent Activity:** {len(anomalies)} signals in last 24h

View on-chain: [Mantle Explorer](https://sepolia.mantlescan.xyz)
"""
            
            await update.message.reply_text(message, parse_mode='Markdown')
            
        except Exception as e:
            logger.error(f"Error in alpha command: {e}")
            await update.message.reply_text(
                "❌ Error generating report. Try again later.",
                parse_mode='Markdown'
            )
    
    async def stats_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /stats command"""
        try:
            # Fetch accuracy stats from database
            response = self.supabase.table('predictions') \
                .select('*') \
                .execute()
            
            predictions = response.data if response.data else []
            
            total = len(predictions)
            verified = len([p for p in predictions if p.get('verified')])
            correct = len([p for p in predictions if p.get('correct')])
            
            accuracy = (correct / verified * 100) if verified > 0 else 0
            
            message = f"""📈 **AlphaPulse Accuracy Stats**

**Total Predictions:** {total}
**Verified:** {verified}
**Correct:** {correct}
**Accuracy:** {accuracy:.1f}%

**By Type:**
🐋 Whale Buys: {len([p for p in predictions if p.get('type') == 'WHALE_BUY'])}
🔴 Liquidity Exits: {len([p for p in predictions if p.get('type') == 'LIQUIDITY_EXIT'])}
🎯 Smart Clusters: {len([p for p in predictions if p.get('type') == 'SMART_CLUSTER'])}
🚀 Momentum Builds: {len([p for p in predictions if p.get('type') == 'MOMENTUM_BUILD'])}

All predictions are verifiable on-chain! 🔗
"""
            
            await update.message.reply_text(message, parse_mode='Markdown')
            
        except Exception as e:
            logger.error(f"Error in stats command: {e}")
            await update.message.reply_text(
                "❌ Error fetching stats. Try again later.",
                parse_mode='Markdown'
            )
    
    async def follow_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /follow <signal_id> command for paper trading"""
        if not context.args:
            await update.message.reply_text(
                "Usage: /follow <signal_id>\nExample: /follow 123",
                parse_mode='Markdown'
            )
            return
        
        user_id = update.effective_user.id
        signal_id = context.args[0]
        
        try:
            # Fetch signal from database
            response = self.supabase.table('anomalies') \
                .select('*') \
                .eq('id', signal_id) \
                .single() \
                .execute()
            
            if not response.data:
                await update.message.reply_text(
                    "❌ Signal not found.",
                    parse_mode='Markdown'
                )
                return
            
            signal = response.data
            
            # Add to paper trades
            if user_id not in self.paper_trades:
                self.paper_trades[user_id] = []
            
            self.paper_trades[user_id].append({
                'signal_id': signal_id,
                'type': signal.get('type'),
                'entry_price': signal.get('price', 0),
                'entry_time': datetime.now(),
                'amount': 1000,  # Virtual $1000
                'status': 'open'
            })
            
            await update.message.reply_text(
                f"✅ **Paper Trade Started**\n\n"
                f"Signal: {signal.get('type')}\n"
                f"Entry: ${signal.get('price', 0):.4f}\n"
                f"Amount: $1,000 (virtual)\n\n"
                f"Use /portfolio to track P&L",
                parse_mode='Markdown'
            )
            
        except Exception as e:
            logger.error(f"Error in follow command: {e}")
            await update.message.reply_text(
                "❌ Error starting paper trade. Try again later.",
                parse_mode='Markdown'
            )
    
    async def portfolio_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /portfolio command"""
        user_id = update.effective_user.id
        
        trades = self.paper_trades.get(user_id, [])
        
        if not trades:
            await update.message.reply_text(
                "📊 **Your Portfolio**\n\n"
                "No paper trades yet. Use /follow <signal_id> to start!",
                parse_mode='Markdown'
            )
            return
        
        total_pnl = 0
        open_trades = [t for t in trades if t['status'] == 'open']
        closed_trades = [t for t in trades if t['status'] == 'closed']
        
        message = f"""📊 **Your Paper Trading Portfolio**

**Open Trades:** {len(open_trades)}
**Closed Trades:** {len(closed_trades)}
**Total P&L:** ${total_pnl:,.2f}

**Recent Trades:**
"""
        
        for trade in trades[-5:]:
            pnl = trade.get('pnl', 0)
            emoji = "🟢" if pnl > 0 else "🔴" if pnl < 0 else "⚪"
            message += f"{emoji} {trade['type']}: ${pnl:+,.2f}\n"
        
        message += "\n💡 This is paper trading - no real money at risk!"
        
        await update.message.reply_text(message, parse_mode='Markdown')
    
    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /help command"""
        await self.start_command(update, context)
    
    async def send_alert(self, anomaly: Anomaly, explanation: str):
        """Send alert to all subscribers"""
        if not self.subscribers:
            logger.debug("No subscribers to send alert to")
            return
        
        # Format alert message
        emoji_map = {
            "WHALE_BUY": "🐋",
            "LIQUIDITY_EXIT": "🔴",
            "SMART_CLUSTER": "🎯",
            "MOMENTUM_BUILD": "🚀"
        }
        
        emoji = emoji_map.get(anomaly.type, "🔔")
        
        message = f"""{emoji} **Smart Money Alert**

**Type:** {anomaly.type}
**Priority:** {anomaly.priority}
**Confidence:** {anomaly.confidence:.0%}

**Wallet:** `{anomaly.wallet[:10]}...{anomaly.wallet[-8:]}`
**Protocol:** {anomaly.protocol}
**Action:** {anomaly.action}

**🧠 AI Insight:**
{explanation}

**📊 On-chain proof:**
[View on Explorer](https://sepolia.mantlescan.xyz/tx/{anomaly.tx_hash})

_Time: {anomaly.timestamp.strftime('%H:%M:%S UTC')}_
"""
        
        # Add action buttons
        keyboard = [
            [
                InlineKeyboardButton("✓ Follow", callback_data=f"follow_{anomaly.tx_hash}"),
                InlineKeyboardButton("✗ Ignore", callback_data=f"ignore_{anomaly.tx_hash}")
            ],
            [
                InlineKeyboardButton("Details →", callback_data=f"details_{anomaly.tx_hash}")
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        # Send to all subscribers
        for user_id in self.subscribers:
            try:
                await self.app.bot.send_message(
                    chat_id=user_id,
                    text=message,
                    parse_mode='Markdown',
                    reply_markup=reply_markup
                )
                logger.info(f"Alert sent to user {user_id}")
            except Exception as e:
                logger.error(f"Error sending alert to user {user_id}: {e}")
    
    async def button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle button callbacks"""
        query = update.callback_query
        await query.answer()
        
        data = query.data
        
        if data.startswith("follow_"):
            await query.edit_message_text(
                text="✅ Signal followed! Check /portfolio to track P&L",
                parse_mode='Markdown'
            )
        elif data.startswith("ignore_"):
            await query.edit_message_text(
                text="✗ Signal ignored",
                parse_mode='Markdown'
            )
        elif data.startswith("details_"):
            tx_hash = data.replace("details_", "")
            await query.edit_message_text(
                text=f"📊 View full details:\nhttps://sepolia.mantlescan.xyz/tx/{tx_hash}",
                parse_mode='Markdown'
            )
    
    async def start_bot(self):
        """Start the Telegram bot"""
        self.app = Application.builder().token(self.token).build()
        
        # Add handlers
        self.app.add_handler(CommandHandler("start", self.start_command))
        self.app.add_handler(CommandHandler("stop", self.stop_command))
        self.app.add_handler(CommandHandler("alpha", self.alpha_command))
        self.app.add_handler(CommandHandler("stats", self.stats_command))
        self.app.add_handler(CommandHandler("follow", self.follow_command))
        self.app.add_handler(CommandHandler("portfolio", self.portfolio_command))
        self.app.add_handler(CommandHandler("help", self.help_command))
        self.app.add_handler(CallbackQueryHandler(self.button_callback))
        
        # Start bot
        await self.app.initialize()
        await self.app.start()
        await self.app.updater.start_polling()
        
        logger.info("Telegram bot started")
    
    async def stop_bot(self):
        """Stop the Telegram bot"""
        if self.app:
            await self.app.updater.stop()
            await self.app.stop()
            await self.app.shutdown()
            logger.info("Telegram bot stopped")
