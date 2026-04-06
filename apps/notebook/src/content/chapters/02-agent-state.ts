import type { Chapter } from "@/lib/types";

export const agentState: Chapter = {
  id: "agent-state",
  title: "Agent State",
  description:
    "The v2 pattern where state lives in the agent and syncs to the frontend.",
  icon: "🔄",
  cells: [
    {
      type: "markdown",
      id: "state-concept",
      content: `# Agent State Pattern

CopilotKit v2 introduces a powerful pattern: **state lives in the agent backend**, not in the frontend. The frontend simply reads and writes to the agent's state, and CopilotKit handles the sync.

This means:
- The agent defines the **shape** of the state (a Python TypedDict)
- The agent modifies state through **tools** (using LangGraph's \`Command(update={...})\`)
- The frontend reads state via \`agent.state\` and writes via \`agent.setState()\`
- Changes propagate **bidirectionally** — user edits sync to the agent, agent edits sync to the UI`,
    },
    {
      type: "code",
      id: "state-schema",
      language: "python",
      filename: "apps/agent/src/todos.py — State Schema",
      content: `from typing import Literal, TypedDict

class Todo(TypedDict):
    id: str
    title: str
    description: str
    emoji: str
    status: Literal["pending", "completed"]

class AgentState(TypedDict):
    todos: list[Todo]`,
    },
    {
      type: "markdown",
      id: "state-tools-intro",
      content: `## Agent Tools

The agent manipulates state through LangGraph tools. The key tool is \`manage_todos\`, which receives a list of todos and returns a \`Command\` that updates the agent's state:`,
    },
    {
      type: "code",
      id: "state-manage-tool",
      language: "python",
      filename: "apps/agent/src/todos.py — manage_todos tool",
      content: `import uuid
from langchain_core.tools import tool
from langchain_core.messages import ToolMessage
from langgraph.types import Command

@tool
def manage_todos(todos: list[Todo], runtime) -> Command:
    """Manage the current todos."""
    # Ensure each todo has a unique ID
    for todo in todos:
        if "id" not in todo or not todo["id"]:
            todo["id"] = str(uuid.uuid4())

    return Command(update={
        "todos": todos,
        "messages": [ToolMessage(
            content="Updated todos successfully.",
            tool_call_id=runtime.tool_call_id,
        )]
    })`,
    },
    {
      type: "markdown",
      id: "state-frontend-intro",
      content: `## Frontend Integration

On the frontend, the \`useAgent()\` hook provides access to the agent's state. The Canvas component reads todos from the agent and sends updates back:`,
    },
    {
      type: "code",
      id: "state-frontend-code",
      language: "tsx",
      filename: "apps/app/src/components/canvas/index.tsx",
      content: `import { useAgent } from "@copilotkit/react-core";

export function Canvas() {
  const { agent } = useAgent();

  return (
    <TodoList
      todos={agent.state?.todos || []}
      onUpdate={(updatedTodos) => agent.setState({ todos: updatedTodos })}
      isAgentRunning={agent.isRunning}
    />
  );
}`,
    },
    {
      type: "playground",
      id: "state-playground",
      title: "Try it: State-driven Todo List",
      files: {
        "/App.js": `import { useState } from "react";

const initialTodos = [
  { id: "1", title: "Learn CopilotKit", emoji: "📚", status: "pending" },
  { id: "2", title: "Build an agent", emoji: "🤖", status: "pending" },
  { id: "3", title: "Ship it!", emoji: "🚀", status: "completed" },
];

export default function App() {
  // In the real app, this state comes from agent.state.todos
  const [todos, setTodos] = useState(initialTodos);

  const toggle = (id) => {
    setTodos(todos.map(t =>
      t.id === id
        ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
        : t
    ));
  };

  const addTodo = () => {
    setTodos([...todos, {
      id: String(Date.now()),
      title: "New todo",
      emoji: "✨",
      status: "pending",
    }]);
  };

  const pending = todos.filter(t => t.status === "pending");
  const completed = todos.filter(t => t.status === "completed");

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
        Agent State: Todos
      </h2>
      <div style={{ display: "flex", gap: 20 }}>
        <Column title="To Do" todos={pending} onToggle={toggle} />
        <Column title="Done" todos={completed} onToggle={toggle} />
      </div>
      <button
        onClick={addTodo}
        style={{
          marginTop: 16, padding: "8px 16px", borderRadius: 8,
          background: "#9599CC", color: "#fff", border: "none",
          cursor: "pointer", fontWeight: 600, fontSize: 13,
        }}
      >
        + Add Todo
      </button>
    </div>
  );
}

function Column({ title, todos, onToggle }) {
  return (
    <div style={{ flex: 1 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>
        {title} ({todos.length})
      </h3>
      {todos.map(t => (
        <div
          key={t.id}
          onClick={() => onToggle(t.id)}
          style={{
            padding: "10px 12px", marginBottom: 8, borderRadius: 8,
            background: t.status === "completed" ? "#f0fdf4" : "#fff",
            border: "1px solid #e5e7eb", cursor: "pointer",
            opacity: t.status === "completed" ? 0.7 : 1,
            textDecoration: t.status === "completed" ? "line-through" : "none",
            fontSize: 14,
          }}
        >
          {t.emoji} {t.title}
        </div>
      ))}
    </div>
  );
}`,
      },
    },
  ],
};
