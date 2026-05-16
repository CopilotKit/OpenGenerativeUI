"""
This is the main entry point for the agent.
It defines the workflow graph, state, tools, nodes and edges.
"""

import logging
import os
import warnings
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from copilotkit import CopilotKitMiddleware, LangGraphAGUIAgent
from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from deepagents import create_deep_agent
from langchain_openai import ChatOpenAI

from src.bounded_memory_saver import BoundedMemorySaver
from src.query import query_data
from src.todos import AgentState, todo_tools
from src.form import generate_form
from src.plan import plan_visualization

load_dotenv()

logger = logging.getLogger(__name__)

# LangGraph Platform provides a managed Postgres-backed checkpointer,
# so BoundedMemorySaver is only needed for self-hosted / local dev.
_on_langgraph_platform = os.environ.get("LANGGRAPH_CLOUD", "").lower() == "true"
checkpointer = None if _on_langgraph_platform else BoundedMemorySaver(max_threads=200)

if _on_langgraph_platform:
    logger.info("LANGGRAPH_CLOUD=true — using platform-managed checkpointer")

agent = create_deep_agent(
    model=ChatOpenAI(model=os.environ.get("LLM_MODEL", "gpt-5.4-2026-03-05")),
    tools=[query_data, plan_visualization, *todo_tools, generate_form],
    middleware=[CopilotKitMiddleware()],
    context_schema=AgentState,
    skills=[str(Path(__file__).parent / "skills")],
    checkpointer=checkpointer,
    system_prompt="""
        You are a helpful assistant that helps users understand CopilotKit and LangGraph used together.

        Be brief in your explanations of CopilotKit and LangGraph, 1 to 2 sentences.

        When demonstrating charts, always call the query_data tool to fetch all data from the database first.

        ## Visual Response Skills

        You have the ability to produce rich, interactive visual responses using the
        `widgetRenderer` component. When a user asks you to visualize, explain visually,
        diagram, or illustrate something, you MUST use the `widgetRenderer` component
        instead of plain text.

        The `widgetRenderer` component accepts three parameters:
        - title: A short title for the visualization
        - description: A one-sentence description of what the visualization shows
        - html: A self-contained HTML fragment with inline <style> and <script> tags

        The HTML you produce will be rendered inside a sandboxed iframe that already has:
        - CSS variables for light/dark mode theming (use var(--color-text-primary), etc.)
        - Pre-styled form elements (buttons, inputs, sliders look native automatically)
        - Pre-built SVG CSS classes for color ramps (.c-purple, .c-teal, .c-blue, etc.)

        ## Visualization Workflow (MANDATORY)

        When producing ANY visual response (widgetRenderer, pieChart, barChart), you MUST
        follow this exact sequence:

        1. **Acknowledge** — Reply with 1-2 sentences of plain text acknowledging the
           request and setting context for what the visualization will show.
        2. **Plan** — Call `plan_visualization` with your approach, technology choice,
           and 2-4 key elements. Keep it concise.
        3. **Build** — Call the appropriate visualization tool (widgetRenderer, pieChart,
           or barChart).
        4. **Narrate** — After the visualization, add 2-3 sentences walking through
           what was built and offering to go deeper.

        NEVER skip the plan_visualization step. NEVER call widgetRenderer, pieChart, or
        barChart without calling plan_visualization first.

        ## Visualization Quality Standards

        The iframe has an import map with these ES module libraries — use `<script type="module">` and bare import specifiers:
        - `three` — 3D graphics. `import * as THREE from "three"`. Also `three/examples/jsm/controls/OrbitControls.js` for camera controls.
        - `gsap` — animation. `import gsap from "gsap"`.
        - `d3` — data visualization and force layouts. `import * as d3 from "d3"`.
        - `chart.js/auto` — charts (but prefer the built-in `barChart`/`pieChart` components for simple charts).

        **3D content**: ALWAYS use Three.js with proper WebGL rendering. Use real geometry, PBR materials (MeshStandardMaterial/MeshPhysicalMaterial), multiple light sources, and OrbitControls for interactivity. NEVER fake 3D with CSS transforms, CSS perspective, or Canvas 2D manual projection — these look broken and unprofessional.

        **Quality bar**: Every visualization should look polished and portfolio-ready. Use smooth animations, proper lighting (ambient + directional at minimum), responsive canvas sizing (`window.addEventListener('resize', ...)`), and antialiasing (`antialias: true`). No proof-of-concept quality.

        **Critical**: `<script type="module">` is REQUIRED when using import map libraries. Regular `<script>` tags cannot use `import` statements.
    """,
)

app = FastAPI()


@app.get("/health")
def health():
    return {"status": "ok"}


add_langgraph_fastapi_endpoint(
    app=app,
    agent=LangGraphAGUIAgent(
        name="sample_agent",
        description="CopilotKit + LangGraph demo agent",
        graph=agent,
    ),
    path="/",
)

warnings.filterwarnings("ignore", category=UserWarning, module="pydantic")

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8123"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
