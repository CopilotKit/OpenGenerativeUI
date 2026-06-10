# Agent Tools

Tools are Python functions that the LangGraph agent can call. They can read and update agent state, fetch data, and perform any server-side logic.

## Creating a Tool

Use the `@tool` decorator from LangChain:

```python
from langchain.tools import tool, ToolRuntime

@tool
def my_tool(arg1: str, arg2: int, runtime: ToolRuntime):
    """Description of what this tool does. The agent reads this to decide when to call it."""
    return f"Result: {arg1} x {arg2}"
```

- The docstring tells the agent when and how to use the tool
- `runtime: ToolRuntime` gives access to agent state (optional parameter)
- Return value is sent back to the agent as the tool result

## Reading State

Access current agent state via `runtime.state`:

```python
# apps/agent/src/todos.py

@tool
def get_todos(runtime: ToolRuntime):
    """Get the current todos."""
    return runtime.state.get("todos", [])
```

## Updating State

Return a `Command` with an `update` dict to modify agent state:

```python
from langgraph.types import Command
from langchain.messages import ToolMessage

@tool
def manage_todos(todos: list[Todo], runtime: ToolRuntime) -> Command:
    """Manage the current todos."""
    # Ensure all todos have unique IDs
    for todo in todos:
        if "id" not in todo or not todo["id"]:
            todo["id"] = str(uuid.uuid4())

    return Command(update={
        "todos": todos,
        "messages": [
            ToolMessage(
                content="Successfully updated todos",
                tool_call_id=runtime.tool_call_id
            )
        ]
    })
```

Key points:
- `Command(update={...})` merges the update into agent state
- Include a `ToolMessage` in the `messages` list to acknowledge the tool call
- Use `runtime.tool_call_id` for the message's `tool_call_id`

## Returning Data (No State Update)

For tools that just return data without modifying state, return the value directly:

```python
# apps/agent/src/query.py

import csv
from pathlib import Path
from langchain.tools import tool

# Load data at module init
_data = []
with open(Path(__file__).parent / "db.csv") as f:
    _data = list(csv.DictReader(f))

@tool
def query_data(query: str):
    """Query the financial transactions database. Call this before creating charts."""
    return _data
```

## Registering Tools with the Agent

Add tools to the agent's `tools` list in `apps/agent/main.py`:

```python
from src.todos import todo_tools  # [manage_todos, get_todos]
from src.query import query_data
from src.plan import plan_visualization

agent = create_deep_agent(
    model=ChatAnthropic(model="claude-fable-5"),
    tools=[query_data, plan_visualization, *todo_tools],
    middleware=[CopilotKitMiddleware()],
    context_schema=AgentState,
    ...
)
```

You can pass individual tools or spread a list of tools.

## Example: Adding a New Tool

Say you want to add a tool that fetches weather data:

**1. Create the tool** (`apps/agent/src/weather.py`):

```python
from langchain.tools import tool

@tool
def get_weather(city: str):
    """Get the current weather for a city."""
    # Your implementation here
    return {"city": city, "temp": 72, "condition": "sunny"}
```

**2. Register it** in `apps/agent/main.py`:

```python
from src.weather import get_weather

agent = create_deep_agent(
    tools=[query_data, plan_visualization, *todo_tools, get_weather],
    ...
)
```

The agent can now call `get_weather` when a user asks about weather. If you want a custom UI for the result, register a `useRenderTool` on the frontend (see [Generative UI](generative-ui.md)).

## Next Steps

- [Agent State](agent-state.md) — How state sync works between tools and the frontend
- [Generative UI](generative-ui.md) — Render custom UI for tool results
