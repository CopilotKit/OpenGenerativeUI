"""
This is the main entry point for the agent.
It defines the workflow graph, state, tools, nodes and edges.
"""

import os
import warnings
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from copilotkit import CopilotKitMiddleware, LangGraphAGUIAgent
from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from deepagents import create_deep_agent

from src.anthropic_compat import ConsecutiveSystemMessagesMiddleware
from src.bounded_memory_saver import BoundedMemorySaver
from src.model import build_model
from src.query import query_data
from src.todos import AgentState, todo_tools
from src.form import generate_form
from src.plan import plan_visualization
from src.prompt import SYSTEM_PROMPT

load_dotenv()

agent = create_deep_agent(
    model=build_model(),
    tools=[query_data, plan_visualization, *todo_tools, generate_form],
    middleware=[CopilotKitMiddleware(), ConsecutiveSystemMessagesMiddleware()],
    context_schema=AgentState,
    skills=[str(Path(__file__).parent / "skills")],
    checkpointer=BoundedMemorySaver(max_threads=200),
    system_prompt=SYSTEM_PROMPT,
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
