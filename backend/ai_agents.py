"""AI Multi-Agent Analysis System for AlphaPulse"""
import asyncio
from typing import Dict, List, Any
from datetime import datetime
from groq import Groq
from loguru import logger


def _groq_call(groq_client: Groq, prompt: str, max_tokens: int = 300) -> str:
    """Synchronous Groq call — run via asyncio.to_thread to avoid blocking event loop"""
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


class BaseAgent:
    def __init__(self, name: str, role: str, groq_client: Groq):
        self.name = name
        self.role = role
        self.groq = groq_client
        self.status = "idle"
        self.last_analysis: str | None = None

    async def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError


class WhaleAgent(BaseAgent):
    def __init__(self, groq_client: Groq):
        super().__init__(
            name="Whale Tracker",
            role="Monitors large wallet movements and identifies smart money patterns",
            groq_client=groq_client,
        )

    async def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        self.status = "analyzing"
        try:
            anomalies = data.get("anomalies", [])
            whale_anomalies = [a for a in anomalies if a.get("type") == "WHALE_BUY"]

            prompt = f"""You are a whale wallet analyst. Analyze:
Whale transactions: {len(whale_anomalies)}
Recent: {whale_anomalies[:3]}

Return JSON only: {{"pattern":"accumulation|distribution","risk":"LOW|MEDIUM|HIGH","insight":"one sentence","confidence":0-100}}"""

            analysis = await asyncio.to_thread(_groq_call, self.groq, prompt)
            self.status = "completed"
            self.last_analysis = datetime.utcnow().isoformat()
            return {
                "agent": self.name,
                "status": "success",
                "data": {"whale_count": len(whale_anomalies), "analysis": analysis, "timestamp": self.last_analysis},
            }
        except Exception as e:
            logger.error(f"WhaleAgent error: {e}")
            self.status = "error"
            return {"agent": self.name, "status": "error", "error": str(e)}


class DEXAgent(BaseAgent):
    def __init__(self, groq_client: Groq):
        super().__init__(
            name="DEX Analyzer",
            role="Monitors DEX liquidity, volume, and trading patterns",
            groq_client=groq_client,
        )

    async def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        self.status = "analyzing"
        try:
            anomalies = data.get("anomalies", [])
            exits = [a for a in anomalies if a.get("type") == "LIQUIDITY_EXIT"]

            prompt = f"""You are a DEX liquidity analyst. Analyze:
Liquidity exits: {len(exits)}
Recent: {exits[:3]}

Return JSON only: {{"health":"HEALTHY|WARNING|CRITICAL","pattern":"normal|suspicious|rug_pull_risk","recommendation":"one sentence","confidence":0-100}}"""

            analysis = await asyncio.to_thread(_groq_call, self.groq, prompt)
            self.status = "completed"
            self.last_analysis = datetime.utcnow().isoformat()
            return {
                "agent": self.name,
                "status": "success",
                "data": {"exit_count": len(exits), "analysis": analysis, "timestamp": self.last_analysis},
            }
        except Exception as e:
            logger.error(f"DEXAgent error: {e}")
            self.status = "error"
            return {"agent": self.name, "status": "error", "error": str(e)}


class RiskAgent(BaseAgent):
    def __init__(self, groq_client: Groq):
        super().__init__(
            name="Risk Assessor",
            role="Evaluates market risk and provides safety recommendations",
            groq_client=groq_client,
        )

    async def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        self.status = "analyzing"
        try:
            anomalies = data.get("anomalies", [])
            types = [a.get("type") for a in anomalies[:10]]

            prompt = f"""You are a risk assessment expert. Analyze:
Total anomalies: {len(anomalies)}
Types: {types}

Return JSON only: {{"risk_level":"LOW|MEDIUM|HIGH|CRITICAL","factors":["factor1","factor2"],"recommendation":"one sentence","confidence":0-100}}"""

            analysis = await asyncio.to_thread(_groq_call, self.groq, prompt)
            self.status = "completed"
            self.last_analysis = datetime.utcnow().isoformat()
            return {
                "agent": self.name,
                "status": "success",
                "data": {"anomaly_count": len(anomalies), "analysis": analysis, "timestamp": self.last_analysis},
            }
        except Exception as e:
            logger.error(f"RiskAgent error: {e}")
            self.status = "error"
            return {"agent": self.name, "status": "error", "error": str(e)}


class SentimentAgent(BaseAgent):
    def __init__(self, groq_client: Groq):
        super().__init__(
            name="Sentiment Analyzer",
            role="Gauges market sentiment and emotional indicators",
            groq_client=groq_client,
        )

    async def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        self.status = "analyzing"
        try:
            anomalies = data.get("anomalies", [])
            bullish = len([a for a in anomalies if a.get("type") in ["WHALE_BUY", "SMART_CLUSTER"]])
            bearish = len([a for a in anomalies if a.get("type") == "LIQUIDITY_EXIT"])

            prompt = f"""You are a market sentiment analyst. Analyze:
Bullish signals: {bullish}
Bearish signals: {bearish}
Recent activity: {anomalies[:3]}

Return JSON only: {{"sentiment":"BULLISH|BEARISH|NEUTRAL","confidence":0-100,"driver":"main driver","outlook":"one sentence prediction"}}"""

            analysis = await asyncio.to_thread(_groq_call, self.groq, prompt)
            self.status = "completed"
            self.last_analysis = datetime.utcnow().isoformat()
            return {
                "agent": self.name,
                "status": "success",
                "data": {"bullish_signals": bullish, "bearish_signals": bearish, "analysis": analysis, "timestamp": self.last_analysis},
            }
        except Exception as e:
            logger.error(f"SentimentAgent error: {e}")
            self.status = "error"
            return {"agent": self.name, "status": "error", "error": str(e)}


class OrchestratorAgent:
    """Coordinates all agents and synthesizes their analysis"""

    def __init__(self, groq_client: Groq):
        self.groq = groq_client
        self.agents: List[BaseAgent] = [
            WhaleAgent(groq_client),
            DEXAgent(groq_client),
            RiskAgent(groq_client),
            SentimentAgent(groq_client),
        ]

    async def run_analysis(self, data: Dict[str, Any]) -> Dict[str, Any]:
        logger.info("Orchestrator: starting multi-agent analysis")
        results = await asyncio.gather(*[agent.analyze(data) for agent in self.agents])
        synthesis = await self._synthesize(list(results))
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "agents": list(results),
            "synthesis": synthesis,
            "status": "completed",
        }

    async def _synthesize(self, agent_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        try:
            insights = [
                {"agent": r["agent"], "data": r.get("data", {})}
                for r in agent_results
                if r["status"] == "success"
            ]

            prompt = f"""You are the Chief AI Analyst. Synthesize these expert analyses:
{insights}

Return JSON only: {{"action":"BUY|SELL|HOLD|WAIT","confidence":0-100,"reasoning":"2-3 sentences","risk_reward":"ratio","time_horizon":"SHORT|MEDIUM|LONG"}}"""

            recommendation = await asyncio.to_thread(_groq_call, self.groq, prompt, 400)
            return {
                "status": "success",
                "recommendation": recommendation,
                "agents_consulted": len(insights),
            }
        except Exception as e:
            logger.error(f"Synthesis error: {e}")
            return {"status": "error", "error": str(e)}

    def get_agent_status(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": a.name,
                "role": a.role,
                "status": a.status,
                "last_analysis": a.last_analysis,
            }
            for a in self.agents
        ]
