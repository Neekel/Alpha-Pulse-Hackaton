"""Configuration settings for AlphaPulse"""
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import Optional


class Settings(BaseSettings):
    # Mantle Network
    mantle_rpc_url: str = "https://rpc.sepolia.mantle.xyz"
    mantle_chain_id: int = 5003
    
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
    api_port: int = Field(default=8000, validation_alias="PORT")
    
    # Monitoring Settings
    poll_interval: int = 10  # seconds
    whale_threshold: float = 50000  # USD
    liquidity_exit_threshold: float = 0.2  # 20%
    cluster_size: int = 5  # wallets
    cluster_time_window: int = 600  # seconds (10 min)
    
    # DEX Addresses (Mantle Sepolia)
    merchant_moe_router: Optional[str] = None
    agni_finance_router: Optional[str] = None

    @field_validator("api_port", mode="before")
    @classmethod
    def parse_api_port(cls, v):
        if isinstance(v, str):
            return int(v)
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
