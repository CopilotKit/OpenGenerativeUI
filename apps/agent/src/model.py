"""Chat model factory for the agent."""

import os

from langchain_anthropic import ChatAnthropic

DEFAULT_MODEL = "claude-fable-5"

# langchain-anthropic defaults max_tokens to 4096, which truncates
# generateSandboxedUi tool args mid-stream (jsFunctions/jsExpressions never
# arrive and the widget is stuck in its preview sandbox). Widget generation
# routinely needs tens of thousands of output tokens.
MAX_TOKENS = 64000


def build_model() -> ChatAnthropic:
    return ChatAnthropic(
        model=os.environ.get("LLM_MODEL", DEFAULT_MODEL),
        max_tokens=MAX_TOKENS,
    )
