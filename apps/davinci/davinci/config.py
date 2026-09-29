from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration. Every value comes from the environment (`DAVINCI_*`)."""

    model_config = SettingsConfigDict(env_prefix="DAVINCI_", extra="ignore")

    # Shared secret the Next.js app sends as `Authorization: Bearer <secret>`.
    secret: str = Field(min_length=16)

    # OpenAI-compatible LLM backend (vLLM). Model names are whatever vLLM was started with.
    llm_url: str = "http://127.0.0.1:8001/v1"
    llm_model_everyday: str = "Qwen/Qwen3.8-27B"
    llm_model_heavy: str = "Qwen/Qwen3.8-27B"
    llm_timeout_s: float = 120.0

    # OpenAI-compatible speech-to-text backend (Qwen3-ASR or faster-whisper server).
    stt_url: str = "http://127.0.0.1:8002/v1"
    stt_model: str = "Qwen/Qwen3-ASR-1.7B"
    stt_timeout_s: float = 120.0

    # OpenAI-compatible embeddings backend (vLLM, second instance).
    embed_url: str = "http://127.0.0.1:8003/v1"
    embed_model: str = "Qwen/Qwen3-Embedding-0.6B"
    embed_dimensions: int = 1024
    embed_timeout_s: float = 30.0

    # Largest audio upload accepted by /v1/transcribe (bytes).
    max_audio_bytes: int = 50 * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()
