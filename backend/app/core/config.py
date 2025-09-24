from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./smart_finance.db"
    secret_key: str = "CHANGE_ME"
    access_token_expire_minutes: int = 60 * 24
    algorithm: str = "HS256"
    tcmb_api_key: Optional[str] = None
    tcmb_gold_series: Optional[str] = None

    model_config = SettingsConfigDict(
        env_prefix="SFT_",
        env_file=".env",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
