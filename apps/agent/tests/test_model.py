"""The agent runs on Anthropic Claude — Fable 5 by default, LLM_MODEL overridable."""

import os

import pytest

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")

from langchain_anthropic import ChatAnthropic

from src.model import build_model


def test_default_model_is_fable():
    model = build_model()
    assert isinstance(model, ChatAnthropic)
    assert model.model == "claude-fable-5"


def test_llm_model_env_override(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("LLM_MODEL", "claude-opus-4-6")
    model = build_model()
    assert model.model == "claude-opus-4-6"


def test_max_tokens_fits_full_widget_generation():
    # langchain-anthropic's default (4096) truncates generateSandboxedUi args
    # mid-stream: css+html arrive but jsFunctions/jsExpressions are cut off, so
    # htmlComplete never fires and the widget never leaves the preview sandbox.
    model = build_model()
    assert model.max_tokens >= 32000


def test_main_uses_build_model():
    import ast
    from pathlib import Path

    main_src = Path(__file__).parent.parent / "main.py"
    tree = ast.parse(main_src.read_text())
    names = {n.id for n in ast.walk(tree) if isinstance(n, ast.Name)}
    assert "build_model" in names
    assert "ChatOpenAI" not in main_src.read_text()
