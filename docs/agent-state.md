# Agent State

The core pattern in this project is **CopilotKit v2's agent state** — state lives in the LangGraph agent and syncs bidirectionally with the React frontend. Both the user and agent can read and write the same state.

## Define State in the Agent

State is defined as a Python `TypedDict` that extends `BaseAgentState`:

```python
# apps/agent/src/todos.py

from langchain.agents import AgentState as BaseAgentState
from typing import TypedDict, Literal

class Todo(TypedDict):
    id: str
    title: str
    description: str
    emoji: str
    status: Literal["pending", "completed"]

class AgentState(BaseAgentState):
    todos: list[Todo]
```

The state schema is passed to the agent via `context_schema`:

```python
# apps/agent/main.py

agent = create_deep_agent(
    model=ChatAnthropic(model="claude-fable-5"),
    tools=[...],
    middleware=[CopilotKitMiddleware()],
    context_schema=AgentState,  # ← state schema
    ...
)
```

## Read State in React

Use the `useAgent()` hook to access agent state:

```tsx
import { useAgent } from "@copilotkit/react-core/v2";

function MyComponent() {
  const { agent } = useAgent();
  const todos = agent.state?.todos || [];

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.emoji} {todo.title}</li>
      ))}
    </ul>
  );
}
```

## Write State from React

Call `agent.setState()` to update state from the frontend:

```tsx
const toggleTodo = (todoId: string) => {
  const updated = todos.map(t =>
    t.id === todoId
      ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
      : t
  );
  agent.setState({ todos: updated });
};

const addTodo = () => {
  const newTodo = {
    id: crypto.randomUUID(),
    title: "New task",
    description: "",
    emoji: "📝",
    status: "pending",
  };
  agent.setState({ todos: [...todos, newTodo] });
};
```

## Write State from Agent Tools

Tools update state by returning a `Command` with an `update` dict:

```python
# apps/agent/src/todos.py

from langgraph.types import Command
from langchain.tools import tool, ToolRuntime
from langchain.messages import ToolMessage

@tool
def manage_todos(todos: list[Todo], runtime: ToolRuntime) -> Command:
    """Manage the current todos."""
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

## Read State in Agent Tools

Use `runtime.state` to read current state:

```python
@tool
def get_todos(runtime: ToolRuntime):
    """Get the current todos."""
    return runtime.state.get("todos", [])
```

## How State Flows

1. **User edits a todo** → `agent.setState({ todos: [...] })`
2. **CopilotKit syncs** the change to the agent backend
3. **Agent observes** the updated state via `runtime.state`
4. **Agent calls a tool** → `Command(update={ "todos": [...] })`
5. **CopilotKit syncs** the update back to the frontend
6. **React re-renders** because `agent.state.todos` changed

The key insight: there is no separate frontend state management. State lives in the agent, and CopilotKit handles the sync.

## Adding New State Fields

To add a new field to agent state:

1. Add the field to `AgentState` in Python:
   ```python
   class AgentState(BaseAgentState):
       todos: list[Todo]
       tags: list[str]  # new field
   ```

2. Read it in React:
   ```tsx
   const tags = agent.state?.tags || [];
   ```

3. Write it from React or tools the same way as above.
