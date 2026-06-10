"""Tests pinning the skills to the canonical generateSandboxedUi contract."""

from pathlib import Path

import pytest

SKILLS_DIR = Path(__file__).resolve().parents[1] / "skills"
SKILL_FILES = sorted(SKILLS_DIR.glob("*/SKILL.md"))
PROCEDURAL_SKILLS = ["master-playbook", "advanced-visualization"]

STALE_INLINE_STYLE_FENCE = "```html\n<style>"


def skill_text(name: str) -> str:
    return (SKILLS_DIR / name / "SKILL.md").read_text()


def test_all_three_skills_present():
    assert [p.parent.name for p in SKILL_FILES] == [
        "advanced-visualization",
        "master-playbook",
        "svg-diagrams",
    ]


@pytest.mark.parametrize("path", SKILL_FILES, ids=lambda p: p.parent.name)
def test_no_skill_references_widget_renderer(path):
    assert "widgetRenderer" not in path.read_text()


@pytest.mark.parametrize("path", SKILL_FILES, ids=lambda p: p.parent.name)
def test_every_skill_names_canonical_tool(path):
    assert "generateSandboxedUi" in path.read_text()


@pytest.mark.parametrize("name", PROCEDURAL_SKILLS)
def test_procedural_skills_document_js_channels(name):
    text = skill_text(name)
    assert "jsFunctions" in text
    assert "jsExpressions" in text


@pytest.mark.parametrize("name", PROCEDURAL_SKILLS)
def test_procedural_skills_document_css_first_reveal(name):
    text = skill_text(name)
    assert "css parameter" in text
    assert "until css is complete" in text.lower()


def test_advanced_visualization_library_guidance_is_canonical():
    text = skill_text("advanced-visualization")
    assert "await import('three')" in text
    assert '<script type="module">' in text
    assert "bare" in text.lower()
    assert "importmap" in text.lower().replace(" ", "")
    for lib in ["three", "gsap", "d3", "chart.js"]:
        assert lib in text.lower(), f"importmap library not documented: {lib}"


@pytest.mark.parametrize("path", SKILL_FILES, ids=lambda p: p.parent.name)
def test_no_inline_style_blocks_in_html_examples(path):
    assert STALE_INLINE_STYLE_FENCE not in path.read_text()


@pytest.mark.parametrize("name", PROCEDURAL_SKILLS)
def test_send_prompt_examples_use_sandbox_bridge(name):
    text = skill_text(name)
    assert "Websandbox.connection.remote.sendPrompt" in text
    assert "sendPrompt('" not in text
