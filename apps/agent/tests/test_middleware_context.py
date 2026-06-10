"""CopilotKitMiddleware must serialize AG-UI Context entries (designSkill,
sandboxFunctions descriptors) that the canonical frontend sends as agent context."""

from ag_ui.core import Context
from copilotkit import CopilotKitMiddleware
from langchain_core.messages import HumanMessage, SystemMessage


class _RuntimeWithoutContext:
    context = None


def test_before_agent_serializes_agui_context_models():
    middleware = CopilotKitMiddleware()
    state = {
        "messages": [SystemMessage(content="sys"), HumanMessage(content="hi")],
        "copilotkit": {
            "context": [
                Context(
                    description="Design guidelines for the generateSandboxedUi tool.",
                    value="Use the design system CSS variables.",
                )
            ]
        },
    }

    result = middleware.before_agent(state, _RuntimeWithoutContext())

    assert result is not None
    inserted = [
        m
        for m in result["messages"]
        if getattr(m, "content", "") and "App Context:" in str(m.content)
    ]
    assert inserted, "context message should be inserted into the prompt"
    assert "generateSandboxedUi" in str(inserted[0].content)
