"""Tests pinning the prompt contract to the canonical generateSandboxedUi tool."""

import inspect

import src.templates as templates
from src.plan import plan_visualization
from src.prompt import SYSTEM_PROMPT
from src.templates import apply_template


def test_prompt_uses_generate_sandboxed_ui_not_widget_renderer():
    assert "generateSandboxedUi" in SYSTEM_PROMPT
    assert "widgetRenderer" not in SYSTEM_PROMPT


def test_prompt_documents_ordered_params():
    params = [
        "initialHeight",
        "placeholderMessages",
        "css",
        "html",
        "jsFunctions",
        "jsExpressions",
    ]
    for param in params:
        assert param in SYSTEM_PROMPT, f"missing param doc: {param}"
    assert SYSTEM_PROMPT.index("css") < SYSTEM_PROMPT.index("html")
    assert "parameter order" in SYSTEM_PROMPT.lower()
    lowered = SYSTEM_PROMPT.lower()
    assert "critical" in lowered or "exact" in lowered


def test_prompt_documents_sandbox_bridge_and_restrictions():
    assert "Websandbox.connection.remote" in SYSTEM_PROMPT
    assert "localStorage" in SYSTEM_PROMPT
    assert "cookies" in SYSTEM_PROMPT.lower()
    assert "same-origin fetch" in SYSTEM_PROMPT.lower()


def test_prompt_preserves_visualization_protocol():
    assert "plan_visualization" in SYSTEM_PROMPT
    assert "NEVER skip the plan_visualization step" in SYSTEM_PROMPT
    assert "Acknowledge" in SYSTEM_PROMPT
    assert "Narrate" in SYSTEM_PROMPT
    assert "query_data" in SYSTEM_PROMPT
    assert "barChart" in SYSTEM_PROMPT
    assert "pieChart" in SYSTEM_PROMPT
    assert "prefer the built-in" in SYSTEM_PROMPT
    assert "Three.js" in SYSTEM_PROMPT
    assert "NEVER fake 3D" in SYSTEM_PROMPT


def test_prompt_documents_library_imports_for_sandbox():
    assert "await import('three')" in SYSTEM_PROMPT
    assert '<script type="module">' in SYSTEM_PROMPT
    assert "bare" in SYSTEM_PROMPT.lower()
    assert "importmap" in SYSTEM_PROMPT.lower().replace(" ", "")


def test_plan_visualization_docstring_names_canonical_tool():
    assert "generateSandboxedUi" in plan_visualization.description
    assert "widgetRenderer" not in plan_visualization.description


def test_templates_docstrings_name_canonical_tool():
    assert "generateSandboxedUi" in apply_template.description
    assert "widgetRenderer" not in apply_template.description
    assert "widgetRenderer" not in inspect.getsource(templates)
