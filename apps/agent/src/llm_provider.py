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


def _detect_provider() -> tuple[str, bool]:
    """Auto-detect provider from environment variables.

    Returns:
        A tuple of (provider_name, explicitly_set) where *explicitly_set* is
        ``True`` when ``LLM_PROVIDER`` was provided by the user.

    Raises:
        ValueError: If ``LLM_PROVIDER`` is set to an unrecognized value.
    """
    explicit = os.environ.get("LLM_PROVIDER", "").strip().lower()
    if explicit:
        if explicit not in PROVIDER_PRESETS:
            supported = ", ".join(sorted(PROVIDER_PRESETS.keys()))
            raise ValueError(
                f"Unsupported LLM_PROVIDER={explicit!r}. "
                f"Supported providers: {supported}"
            )
        return explicit, True

    if os.environ.get("MINIMAX_API_KEY"):
        return "minimax", False

    return "openai", False


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
    provider, explicitly_set = _detect_provider()
    preset = PROVIDER_PRESETS.get(provider, {})

    model = os.environ.get("LLM_MODEL") or preset.get("default_model") or "gpt-5.4-2026-03-05"
    base_url = os.environ.get("LLM_BASE_URL") or preset.get("base_url")

    # Resolve API key – only fall back to OPENAI_API_KEY when the provider
    # was auto-detected (not explicitly requested) or *is* openai.
    api_key_env = preset.get("api_key_env", "OPENAI_API_KEY")
    api_key = os.environ.get(api_key_env)

    if not api_key:
        if explicitly_set and provider != "openai":
            raise ValueError(
                f"LLM_PROVIDER={provider!r} requires the {api_key_env} "
                f"environment variable to be set."
            )
        # Auto-detected or openai provider: fall back to OPENAI_API_KEY
        api_key = os.environ.get("OPENAI_API_KEY", "")

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
