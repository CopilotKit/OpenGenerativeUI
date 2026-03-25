"""
LLM provider factory for multi-provider support.

Supports OpenAI (default), MiniMax, and any OpenAI-compatible provider
via the LLM_BASE_URL environment variable.

Provider auto-detection priority:
  1. Explicit LLM_PROVIDER env var
  2. MINIMAX_API_KEY present → minimax
  3. OPENAI_API_KEY present → openai (default)

MiniMax models use the OpenAI-compatible API at https://api.minimax.io/v1
with temperature clamped to (0.0, 1.0].
"""

import os
from langchain_openai import ChatOpenAI


# Provider presets: base_url and api_key env var name
PROVIDER_PRESETS = {
    "openai": {
        "base_url": None,  # uses default
        "api_key_env": "OPENAI_API_KEY",
    },
    "minimax": {
        "base_url": "https://api.minimax.io/v1",
        "api_key_env": "MINIMAX_API_KEY",
        "default_model": "MiniMax-M2.7",
    },
}

# Models that require temperature clamping to (0.0, 1.0]
_CLAMP_TEMPERATURE_PROVIDERS = {"minimax"}


def _detect_provider() -> str:
    """Auto-detect provider from environment variables."""
    explicit = os.environ.get("LLM_PROVIDER", "").strip().lower()
    if explicit:
        return explicit

    if os.environ.get("MINIMAX_API_KEY"):
        return "minimax"

    return "openai"


def create_llm() -> ChatOpenAI:
    """
    Create a ChatOpenAI-compatible LLM instance based on environment config.

    Environment variables:
        LLM_PROVIDER   – Provider name: "openai" | "minimax" (auto-detected if unset)
        LLM_MODEL      – Model name (provider-specific default if unset)
        LLM_BASE_URL   – Custom base URL (overrides provider preset)
        LLM_TEMPERATURE – Temperature value (default: 0.7)
        OPENAI_API_KEY  – OpenAI API key
        MINIMAX_API_KEY – MiniMax API key
    """
    provider = _detect_provider()
    preset = PROVIDER_PRESETS.get(provider, {})

    model = os.environ.get("LLM_MODEL") or preset.get("default_model") or "gpt-5.4-2026-03-05"
    base_url = os.environ.get("LLM_BASE_URL") or preset.get("base_url")

    # Resolve API key
    api_key_env = preset.get("api_key_env", "OPENAI_API_KEY")
    api_key = os.environ.get(api_key_env) or os.environ.get("OPENAI_API_KEY", "")

    # Parse temperature
    temperature = float(os.environ.get("LLM_TEMPERATURE", "0.7"))

    # Clamp temperature for providers that require it (MiniMax: (0.0, 1.0])
    if provider in _CLAMP_TEMPERATURE_PROVIDERS:
        temperature = max(0.01, min(temperature, 1.0))

    kwargs = {
        "model": model,
        "temperature": temperature,
    }

    if base_url:
        kwargs["base_url"] = base_url

    if api_key:
        kwargs["api_key"] = api_key

    return ChatOpenAI(**kwargs)
