"""AI Multi-Agent Analysis System for AlphaPulse"""
import asyncio
from typing import Dict, List, Any
from datetime import datetime
from groq import Groq
from loguru import logger


class BaseAgent:
    """Base class for all AI agents"""
    
    def __init__(self, name: str, role: str, groq_client: Groq):
        self.name = name
        self.role = role
        self.groq = groq_client
        self.status = "idle"
        self.last_analysis = None
    
    async def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Override in subclasses"""
        raise NotImplementedError


class WhaleAgent(BaseAgent):
    """Analyzes whale wallet movements and patterns"""
    
    def __init__(self, groq_client: Groq):
        super().__init__(
            name="Whale Tracker",
            role="Monitors large wallet movements and identifies smart money patterns"
        )
        self.groq = groq_client
    
    async def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze whale activity"""
        self.status = "analyzing"
        
        try:
            anomalies = data.get('anomalies', [])
            whale_anomalies = [a for a in anomalies if a.get('type') == 'WHALE_BUY']
            
            # AI analysis
            prompt = f"""You are a whale wallet analyst. Analyze this data:

Whale transactions detected: {len(whale_anomalies)}
Recent whale buys: {whale_anomalies[:3]}

Provide:
1. Pattern analysis (are whales accumulating or distributing?)
2. Risk level (LOW/MEDIUM/HIGH)
3. Actionable insight (1 sentence)
4. Confidence score (0-100)

Format: JSON with keys: pattern, risk, insight, confidence"""

            response = self.groq.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=300
            )
            
            analysis = response.choices[0].message.content
            
            self.status = "completed"
            self.last_analysis = datetime.utcnow().isoformat()
            
            return {
                "agent": self.name,
                "status": "success",
                "data": {
                    "whale_count": len(whale_anomalies),
                    "analysis": analysis,
                    "timestamp": self.last_analysis
                }
            }
        except Exception as e:
            logger.error(f"WhaleAgent error: {e}")
            self.status = "error"
            return {
                "agent": self.name,
                "status": "error",
                "error": str(e)
            }


class DEXAgent(BaseAgent):
    """Analyzes DEX liquidity and trading patterns"""
    
    def __init__(self, groq_client: Groq):
        super().__init__(
            name="DEX Analyzer",
            role="Monitors DEX liquidity, volume, and trading patterns"
        )
        self.groq = groq_client
    
    async def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze DEX activity"""
        self.status = "analyzing"
        
        try:
            anomalies = data.get('anomalies', [])
            liquidity_exits = [a for a in anomalies if a.get('type') == 'LIQUIDITY_EXIT']
            
            prompt = f"""You are a DEX liquidity analyst. Analyze:

Liquidity exits detected: {len(liquidity_exits)}
Recent exits: {liquidity_exits[:3]}

Provide:
1. Liquidity health (HEALTHY/WARNING/CRITICAL)
2. Exit pattern (normal/suspicious/rug pull risk)
3. Recommendation (1 sentence)
4. Confidence score (0-100)

Format: JSON with keys: health, pattern, recommendation, confidence"""

            response = self.groq.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=300
            )
            
            analysis = response.choices[0].message.content
            
            self.status = "completed"
            self.last_analysis = datetime.utcnow().isoformat()
            
            return {
                "agent": self.name,
                "status": "success",
                "data": {
                    "exit_count": len(liquidity_exits),
                    "analysis": analysis,
                    "timestamp": self.last_analysis
                }
            }
        except Exception as e:
            logger.error(f"DEXAgent error: {e}")
            self.status = "error"
            return {
                "agent": self.name,
                "status": "error",
                "error": str(e)
            }


class RiskAgent(BaseAgent):
    """Assesses overall market risk"""
    
    def __init__(self, groq_client: Groq):
        super().__init__(
            name="Risk Assessor",
            role="Evaluates market risk and provides safety recommendations"
        )
        self.groq = groq_client
    
    async def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze risk factors"""
        self.status = "analyzing"
        
        try:
            anomalies = data.get('anomalies', [])
            
            prompt = f"""You are a risk assessment expert. Analyze:

Total anomalies: {len(anomalies)}
Types: {[a.get('type') for a in anomalies[:5]]}

Provide:
1. Overall risk level (LOW/MEDIUM/HIGH/CRITICAL)
2. Main risk factors (list 2-3)
3. Safety recommendation (1 sentence)
4. Confidence score (0-100)

Format: JSON with keys: risk_level, factors, recommendation, confidence"""

            response = self.groq.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=300
            )
            
            analysis = response.choices[0].message.content
            
            self.status = "completed"
            self.last_analysis = datetime.utcnow().isoformat()
            
            return {
                "agent": self.name,
                "status": "success",
                "data": {
                    "anomaly_count": len(anomalies),
                    "analysis": analysis,
                    "timestamp": self.last_analysis
                }
            }
        except Exception as e:
            logger.error(f"RiskAgent error: {e}")
            self.status = "error"
            return {
                "agent": self.name,
                "status": "error",
                "error": str(e)
            }


class SentimentAgent(BaseAgent):
    """Analyzes market sentiment"""
    
    def __init__(self, groq_client: Groq):
        super().__init__(
            name="Sentiment Analyzer",
            role="Gauges market sentiment and emotional indicators"
        )
        self.groq = groq_client
    
    async def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze market sentiment"""
        self.status = "analyzing"
        
        try:
            anomalies = data.get('anomalies', [])
            
            # Count bullish vs bearish signals
            bullish = len([a for a in anomalies if a.get('type') in ['WHALE_BUY', 'SMART_CLUSTER']])
            bearish = len([a for a in anomalies if a.get('type') == 'LIQUIDITY_EXIT'])
            
            prompt = f"""You are a market sentiment analyst. Analyze:

Bullish signals: {bullish}
Bearish signals: {bearish}
Recent activity: {anomalies[:3]}

Provide:
1. Sentiment (BULLISH/BEARISH/NEUTRAL)
2. Confidence level (0-100)
3. Key driver (what's driving sentiment)
4. Outlook (1 sentence prediction)

Format: JSON with keys: sentiment, confidence, driver, outlook"""

            response = self.groq.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=300
            )
            
            analysis = response.choices[0].message.content
            
            self.status = "completed"
            self.last_analysis = datetime.utcnow().isoformat()
            
            return {
                "agent": self.name,
                "status": "success",
                "data": {
                    "bullish_signals": bullish,
                    "bearish_signals": bearish,
                    "analysis": analysis,
                    "timestamp": self.last_analysis
                }
            }
        except Exception as e:
            logger.error(f"SentimentAgent error: {e}")
            self.status = "error"
            return {
                "agent": self.name,
                "status": "error",
                "error": str(e)
            }


class OrchestratorAgent:
    """Coordinates all agents and synthesizes their analysis"""
    
    def __init__(self, groq_client: Groq):
        self.groq = groq_client
        self.agents = [
            WhaleAgent(groq_client),
            DEXAgent(groq_client),
            RiskAgent(groq_client),
            SentimentAgent(groq_client)
        ]
    
    async def run_analysis(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Run all agents in parallel and synthesize results"""
        logger.info("Orchestrator: Starting multi-agent analysis")
        
        # Run all agents in parallel
        tasks = [agent.analyze(data) for agent in self.agents]
        results = await asyncio.gather(*tasks)
        
        # Synthesize results
        synthesis = await self._synthesize(results)
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "agents": results,
            "synthesis": synthesis,
            "status": "completed"
        }
    
    async def _synthesize(self, agent_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Synthesize all agent analyses into final recommendation"""
        
        try:
            # Extract key insights from each agent
            insights = []
            for result in agent_results:
                if result['status'] == 'success':
                    insights.append({
                        'agent': result['agent'],
                        'data': result['data']
                    })
            
            prompt = f"""You are the Chief AI Analyst. Synthesize these expert analyses:

{insights}

Provide a FINAL RECOMMENDATION:
1. Action (BUY/SELL/HOLD/WAIT)
2. Confidence (0-100)
3. Reasoning (2-3 sentences combining all insights)
4. Risk/Reward ratio
5. Time horizon (SHORT/MEDIUM/LONG)

Format: JSON with keys: action, confidence, reasoning, risk_reward, time_horizon"""

            response = self.groq.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=500
            )
            
            synthesis = response.choices[0].message.content
            
            return {
                "status": "success",
                "recommendation": synthesis,
                "agents_consulted": len(insights)
            }
        except Exception as e:
            logger.error(f"Synthesis error: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def get_agent_status(self) -> List[Dict[str, Any]]:
        """Get status of all agents"""
        return [
            {
                "name": agent.name,
                "role": agent.role,
                "status": agent.status,
                "last_analysis": agent.last_analysis
            }
            for agent in self.agents
        ]
