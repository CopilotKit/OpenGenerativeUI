"""Planning tool for visualization generation."""

from langchain.tools import tool


@tool
def plan_visualization(
    approach: str,
    technology: str,
    key_elements: list[str],
    mode: str = "new",
) -> str:
    """Plan a visualization before building it. MUST be called before
    widgetRenderer, pieChart, or barChart. Outlines the approach, technology
    choice, and key elements.

    Args:
        approach: One sentence describing the visualization strategy.
            For edits, describe only the targeted changes.
        technology: The primary technology (e.g. "inline SVG", "Chart.js",
            "HTML + Canvas", "Three.js", "Mermaid", "D3.js").
        key_elements: 2-4 concise bullet points describing what will be built.
            For edits, list only the elements being modified.
        mode: "new" for a fresh visualization, "edit" for modifying an
            existing one.
    """
    elements = "\n".join(f"  - {e}" for e in key_elements)
    if mode == "edit":
        return f"Edit Plan: {approach}\nTech: {technology}\nChanges:\n{elements}"
    return f"Plan: {approach}\nTech: {technology}\n{elements}"
