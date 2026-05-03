"""AI-powered explanation generator using Groq"""
from groq import Groq
from typing import Dict, Any
from loguru import logger
from detectors import Anomaly


class AIExplainer:
    def __init__(self, api_key: str, model: str = "llama-3.3-70b-versatile"):
        self.client = Groq(api_key=api_key)
        self.model = model
    
    def explain_anomaly(self, anomaly: Anomaly, historical_context: str = "") -> str:
        """Generate human-readable explanation for an anomaly"""
        try:
            prompt = self._build_prompt(anomaly, historical_context)
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a DeFi analyst explaining smart money movements. Be concise, insightful, and actionable. Focus on what this means for traders."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=200
            )
            
            explanation = response.choices[0].message.content.strip()
            logger.info(f"Generated explanation for {anomaly.type}")
            return explanation
            
        except Exception as e:
            logger.error(f"Error generating explanation: {e}")
            return self._fallback_explanation(anomaly)
    
    def _build_prompt(self, anomaly: Anomaly, historical_context: str) -> str:
        """Build prompt for AI explanation"""
        prompt = f"""Analyze this smart money movement on Mantle Network:

Type: {anomaly.type}
Wallet: {anomaly.wallet}
Protocol: {anomaly.protocol}
Action: {anomaly.action}
Amount: ${anomaly.amount:,.0f}
Confidence: {anomaly.confidence:.0%}
Priority: {anomaly.priority}

Metadata: {anomaly.metadata}

{historical_context}

Provide a 2-3 sentence insight:
1. What this wallet/pattern historically does
2. What this signals for the market
3. Actionable takeaway for traders

Keep it concise and focused on alpha."""
        
        return prompt
    
    def _fallback_explanation(self, anomaly: Anomaly) -> str:
        """Fallback explanation if AI fails"""
        explanations = {
            "WHALE_BUY": f"Large wallet accumulated ${anomaly.amount:,.0f} in a short time. This level of buying pressure often precedes price movement.",
            "LIQUIDITY_EXIT": f"Significant liquidity removal detected. This could signal reduced confidence or preparation for a major move.",
            "SMART_CLUSTER": f"Multiple wallets coordinated buying. This pattern suggests informed traders positioning before an event.",
            "MOMENTUM_BUILD": f"Volume significantly above normal. Momentum is building - watch for continuation or reversal."
        }
        
        return explanations.get(anomaly.type, "Unusual smart money activity detected. Monitor closely.")
    
    def generate_alpha_report(self, token: str, anomalies: list, price_data: Dict[str, Any]) -> str:
        """Generate comprehensive alpha report for a token"""
        try:
            prompt = f"""Generate an alpha report for {token} on Mantle Network:

Recent Anomalies:
{self._format_anomalies(anomalies)}

Price Data:
- Current: ${price_data.get('current', 0):.4f}
- 24h Change: {price_data.get('change_24h', 0):.2f}%
- Volume 24h: ${price_data.get('volume_24h', 0):,.0f}

Provide:
1. Smart money sentiment (bullish/bearish/neutral)
2. Key patterns observed
3. Risk level (1-10)
4. Actionable recommendation

Keep it under 150 words."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a DeFi analyst providing alpha reports. Be direct and actionable."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=250
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating alpha report: {e}")
            return f"Unable to generate report for {token}. Check back later."
    
    def _format_anomalies(self, anomalies: list) -> str:
        """Format anomalies for prompt"""
        if not anomalies:
            return "No recent anomalies detected."
        
        formatted = []
        for i, anomaly in enumerate(anomalies[:5], 1):  # Max 5
            formatted.append(
                f"{i}. {anomaly.type}: {anomaly.action} "
                f"(Confidence: {anomaly.confidence:.0%})"
            )
        
        return "\n".join(formatted)
