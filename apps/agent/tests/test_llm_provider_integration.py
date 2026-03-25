"""
Integration tests for the MiniMax LLM provider.

These tests call the real MiniMax API and are skipped when MINIMAX_API_KEY
is not set.  Run with:

    MINIMAX_API_KEY=<your-key> pytest tests/test_llm_provider_integration.py -v
"""

import os

import pytest
from langchain_core.messages import HumanMessage

from src.llm_provider import create_llm

pytestmark = pytest.mark.skipif(
    not os.environ.get("MINIMAX_API_KEY"),
    reason="MINIMAX_API_KEY not set — skipping MiniMax integration tests",
)


@pytest.fixture
def minimax_llm():
    """Create a MiniMax LLM instance for testing."""
    os.environ.setdefault("LLM_PROVIDER", "minimax")
    return create_llm()


class TestMiniMaxIntegration:
    """Integration tests against the real MiniMax API."""

    def test_basic_chat_completion(self, minimax_llm):
        """Verify a simple chat completion returns a non-empty response."""
        result = minimax_llm.invoke([HumanMessage(content="Say 'hello' and nothing else.")])
        assert result.content
        assert "hello" in result.content.lower()

    def test_streaming_response(self, minimax_llm):
        """Verify streaming produces at least one chunk."""
        chunks = list(minimax_llm.stream([HumanMessage(content="Count from 1 to 3.")]))
        assert len(chunks) > 0
        full_text = "".join(c.content for c in chunks)
        assert "1" in full_text

    def test_multi_turn_conversation(self, minimax_llm):
        """Verify the model handles multi-turn conversations."""
        from langchain_core.messages import AIMessage

        messages = [
            HumanMessage(content="My name is Alice."),
            AIMessage(content="Nice to meet you, Alice!"),
            HumanMessage(content="What is my name?"),
        ]
        result = minimax_llm.invoke(messages)
        assert "alice" in result.content.lower()
