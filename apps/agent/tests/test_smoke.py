"""Smoke test proving the pytest harness runs against real agent code."""

from src.plan import plan_visualization


def test_plan_visualization_is_a_langchain_tool():
    assert plan_visualization.name == "plan_visualization"
