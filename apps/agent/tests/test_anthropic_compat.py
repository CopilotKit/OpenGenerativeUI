"""Anthropic rejects non-consecutive system messages. CopilotKitMiddleware's
"App Context" SystemMessage is appended after the human turn by the
add_messages reducer, so the model request must be reordered before the call."""

import asyncio
import os

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")

from langchain.agents.middleware import ModelRequest
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from src.anthropic_compat import ConsecutiveSystemMessagesMiddleware
from src.model import build_model


def _wrap(messages):
    middleware = ConsecutiveSystemMessagesMiddleware()
    request = ModelRequest(model=build_model(), messages=list(messages))
    seen = {}

    def handler(req):
        seen["messages"] = list(req.messages)
        return "called"

    result = middleware.wrap_model_call(request, handler)
    assert result == "called"
    return seen["messages"]


def test_moves_trailing_system_message_to_front():
    human = HumanMessage(content="build an airplane")
    ctx = SystemMessage(content="App Context: design skill")
    assert _wrap([human, ctx]) == [ctx, human]


def test_preserves_relative_order_of_system_messages():
    s1 = SystemMessage(content="first")
    human = HumanMessage(content="hi")
    s2 = SystemMessage(content="App Context: second")
    assert _wrap([s1, human, s2]) == [s1, s2, human]


def test_noop_when_already_consecutive():
    s1 = SystemMessage(content="first")
    human = HumanMessage(content="hi")
    ai = AIMessage(content="ok")
    assert _wrap([s1, human, ai]) == [s1, human, ai]


def test_async_path_reorders_too():
    middleware = ConsecutiveSystemMessagesMiddleware()
    human = HumanMessage(content="hi")
    ctx = SystemMessage(content="App Context: x")
    request = ModelRequest(model=build_model(), messages=[human, ctx])
    seen = {}

    async def handler(req):
        seen["messages"] = list(req.messages)
        return "called"

    result = asyncio.run(middleware.awrap_model_call(request, handler))
    assert result == "called"
    assert seen["messages"] == [ctx, human]


def test_repairs_thinking_block_missing_text_field():
    # Streaming a zero-length thinking block yields {type, signature} with no
    # "thinking" key; Anthropic 400s on replay unless the field is restored.
    broken = AIMessage(
        content=[
            {"type": "thinking", "signature": "sig123"},
            {"type": "text", "text": "I'll build a plane."},
        ]
    )
    human = HumanMessage(content="build it")
    messages = _wrap([human, broken])
    repaired_block = messages[-1].content[0]
    assert repaired_block["thinking"] == ""
    assert repaired_block["signature"] == "sig123"
    assert messages[-1].content[1] == {"type": "text", "text": "I'll build a plane."}


def test_intact_thinking_block_unchanged():
    ok = AIMessage(
        content=[{"type": "thinking", "thinking": "hmm", "signature": "s"}]
    )
    messages = _wrap([HumanMessage(content="hi"), ok])
    assert messages[-1].content[0]["thinking"] == "hmm"


def test_agent_registers_compat_middleware():
    from pathlib import Path

    main_src = (Path(__file__).parent.parent / "main.py").read_text()
    assert "ConsecutiveSystemMessagesMiddleware" in main_src
