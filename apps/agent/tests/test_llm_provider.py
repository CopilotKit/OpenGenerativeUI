"""Unit tests for the LLM provider factory."""

import os
from unittest.mock import patch, MagicMock

import pytest

from src.llm_provider import create_llm, _detect_provider, PROVIDER_PRESETS


# ---------------------------------------------------------------------------
# _detect_provider tests
# ---------------------------------------------------------------------------


class TestDetectProvider:
    """Tests for provider auto-detection logic."""

    @patch.dict(os.environ, {}, clear=True)
    def test_defaults_to_openai(self):
        assert _detect_provider() == "openai"

    @patch.dict(os.environ, {"LLM_PROVIDER": "minimax"}, clear=True)
    def test_explicit_provider_minimax(self):
        assert _detect_provider() == "minimax"

    @patch.dict(os.environ, {"LLM_PROVIDER": "openai"}, clear=True)
    def test_explicit_provider_openai(self):
        assert _detect_provider() == "openai"

    @patch.dict(os.environ, {"LLM_PROVIDER": "  MiniMax  "}, clear=True)
    def test_explicit_provider_strips_and_lowercases(self):
        assert _detect_provider() == "minimax"

    @patch.dict(os.environ, {"MINIMAX_API_KEY": "mm-test-key"}, clear=True)
    def test_auto_detect_minimax_from_api_key(self):
        assert _detect_provider() == "minimax"

    @patch.dict(os.environ, {"OPENAI_API_KEY": "sk-test"}, clear=True)
    def test_auto_detect_openai_from_api_key(self):
        assert _detect_provider() == "openai"

    @patch.dict(
        os.environ,
        {"LLM_PROVIDER": "openai", "MINIMAX_API_KEY": "mm-test-key"},
        clear=True,
    )
    def test_explicit_provider_takes_priority_over_auto_detect(self):
        assert _detect_provider() == "openai"

    @patch.dict(
        os.environ,
        {"MINIMAX_API_KEY": "mm-key", "OPENAI_API_KEY": "sk-key"},
        clear=True,
    )
    def test_minimax_key_takes_priority_over_openai_key(self):
        assert _detect_provider() == "minimax"


# ---------------------------------------------------------------------------
# PROVIDER_PRESETS tests
# ---------------------------------------------------------------------------


class TestProviderPresets:
    """Tests for provider preset configuration."""

    def test_openai_preset_exists(self):
        assert "openai" in PROVIDER_PRESETS

    def test_minimax_preset_exists(self):
        assert "minimax" in PROVIDER_PRESETS

    def test_minimax_base_url(self):
        assert PROVIDER_PRESETS["minimax"]["base_url"] == "https://api.minimax.io/v1"

    def test_minimax_default_model(self):
        assert PROVIDER_PRESETS["minimax"]["default_model"] == "MiniMax-M2.7"

    def test_minimax_api_key_env(self):
        assert PROVIDER_PRESETS["minimax"]["api_key_env"] == "MINIMAX_API_KEY"

    def test_openai_no_base_url(self):
        assert PROVIDER_PRESETS["openai"]["base_url"] is None


# ---------------------------------------------------------------------------
# create_llm tests
# ---------------------------------------------------------------------------


class TestCreateLlm:
    """Tests for the LLM factory function."""

    @patch.dict(
        os.environ,
        {"OPENAI_API_KEY": "sk-test-key"},
        clear=True,
    )
    def test_creates_openai_llm_by_default(self):
        llm = create_llm()
        assert llm.model_name == "gpt-5.4-2026-03-05"

    @patch.dict(
        os.environ,
        {"MINIMAX_API_KEY": "mm-test-key"},
        clear=True,
    )
    def test_creates_minimax_llm_from_api_key(self):
        llm = create_llm()
        assert llm.model_name == "MiniMax-M2.7"
        assert "minimax.io" in str(llm.openai_api_base)

    @patch.dict(
        os.environ,
        {"LLM_PROVIDER": "minimax", "MINIMAX_API_KEY": "mm-key"},
        clear=True,
    )
    def test_minimax_uses_correct_base_url(self):
        llm = create_llm()
        assert str(llm.openai_api_base) == "https://api.minimax.io/v1"

    @patch.dict(
        os.environ,
        {
            "LLM_PROVIDER": "minimax",
            "MINIMAX_API_KEY": "mm-key",
            "LLM_MODEL": "MiniMax-M2.7-highspeed",
        },
        clear=True,
    )
    def test_minimax_custom_model(self):
        llm = create_llm()
        assert llm.model_name == "MiniMax-M2.7-highspeed"

    @patch.dict(
        os.environ,
        {
            "LLM_PROVIDER": "minimax",
            "MINIMAX_API_KEY": "mm-key",
            "LLM_TEMPERATURE": "0.0",
        },
        clear=True,
    )
    def test_minimax_temperature_clamped_above_zero(self):
        llm = create_llm()
        assert llm.temperature >= 0.01

    @patch.dict(
        os.environ,
        {
            "LLM_PROVIDER": "minimax",
            "MINIMAX_API_KEY": "mm-key",
            "LLM_TEMPERATURE": "1.5",
        },
        clear=True,
    )
    def test_minimax_temperature_clamped_at_one(self):
        llm = create_llm()
        assert llm.temperature <= 1.0

    @patch.dict(
        os.environ,
        {
            "OPENAI_API_KEY": "sk-key",
            "LLM_TEMPERATURE": "0.0",
        },
        clear=True,
    )
    def test_openai_temperature_not_clamped(self):
        llm = create_llm()
        assert llm.temperature == 0.0

    @patch.dict(
        os.environ,
        {
            "OPENAI_API_KEY": "sk-key",
            "LLM_TEMPERATURE": "0.5",
        },
        clear=True,
    )
    def test_custom_temperature(self):
        llm = create_llm()
        assert llm.temperature == 0.5

    @patch.dict(
        os.environ,
        {
            "LLM_PROVIDER": "minimax",
            "MINIMAX_API_KEY": "mm-key",
            "LLM_BASE_URL": "https://custom.proxy.example.com/v1",
        },
        clear=True,
    )
    def test_custom_base_url_overrides_preset(self):
        llm = create_llm()
        assert "custom.proxy.example.com" in str(llm.openai_api_base)

    @patch.dict(
        os.environ,
        {
            "OPENAI_API_KEY": "sk-key",
            "LLM_MODEL": "gpt-5.4-pro",
        },
        clear=True,
    )
    def test_openai_custom_model(self):
        llm = create_llm()
        assert llm.model_name == "gpt-5.4-pro"

    @patch.dict(
        os.environ,
        {
            "LLM_PROVIDER": "minimax",
            "MINIMAX_API_KEY": "mm-key",
            "LLM_TEMPERATURE": "0.7",
        },
        clear=True,
    )
    def test_minimax_normal_temperature_passes_through(self):
        llm = create_llm()
        assert llm.temperature == 0.7


# ---------------------------------------------------------------------------
# Edge cases
# ---------------------------------------------------------------------------


class TestEdgeCases:
    """Edge case tests for provider factory."""

    @patch.dict(
        os.environ,
        {"LLM_PROVIDER": "unknown_provider", "OPENAI_API_KEY": "sk-key"},
        clear=True,
    )
    def test_unknown_provider_falls_back_to_defaults(self):
        llm = create_llm()
        # Should still create an LLM with default model
        assert llm.model_name == "gpt-5.4-2026-03-05"

    @patch.dict(
        os.environ,
        {
            "MINIMAX_API_KEY": "mm-key",
            "OPENAI_API_KEY": "sk-key",
            "LLM_PROVIDER": "",
        },
        clear=True,
    )
    def test_empty_provider_triggers_auto_detect(self):
        llm = create_llm()
        assert llm.model_name == "MiniMax-M2.7"

    @patch.dict(
        os.environ,
        {
            "LLM_PROVIDER": "minimax",
            "OPENAI_API_KEY": "sk-fallback",
        },
        clear=True,
    )
    def test_minimax_provider_falls_back_to_openai_key(self):
        """When MINIMAX_API_KEY is unset but LLM_PROVIDER=minimax, use OPENAI_API_KEY as fallback."""
        llm = create_llm()
        assert llm.model_name == "MiniMax-M2.7"
