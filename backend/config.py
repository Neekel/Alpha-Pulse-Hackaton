"""Configuration settings for AlphaPulse"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Mantle Network
    mantle_rpc_url: str = "https://rpc.mantle.xyz"
    mantle_chain_id: int = 5000
    
    # Groq AI
    groq_api_key: str
    groq_model: str = "llama-3.3-70b-versatile"
    
    # Telegram Bot
    telegram_bot_token: str
    
    # Supabase
    supabase_url: str
    supabase_key: str
    
    # API Settings
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    # Monitoring Settings
    poll_interval: int = 10  # seconds
    whale_threshold: float = 50000  # USD
    liquidity_exit_threshold: float = 0.2  # 20%
    cluster_size: int = 5  # wallets
    cluster_time_window: int = 600  # seconds (10 min)
    
    # DEX Addresses (Mantle Sepolia)
    merchant_moe_router: Optional[str] = None
    agni_finance_router: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
