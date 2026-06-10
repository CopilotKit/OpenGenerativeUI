"""Chat model factory for the agent."""

import os

from langchain_anthropic import ChatAnthropic

DEFAULT_MODEL = "claude-fable-5"


def build_model() -> ChatAnthropic:
    return ChatAnthropic(model=os.environ.get("LLM_MODEL", DEFAULT_MODEL))
