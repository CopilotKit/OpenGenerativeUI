import type { Chapter } from "@/lib/types";

export const copilotKitHooks: Chapter = {
  id: "copilotkit-hooks",
  title: "CopilotKit Hooks",
  description:
    "The React hooks that connect your frontend to the AI agent.",
  icon: "🪝",
  cells: [
    {
      type: "markdown",
      id: "hooks-overview",
      content: `# CopilotKit Hooks

CopilotKit provides several React hooks that form the bridge between your frontend and the AI agent. Here's an overview of the key hooks used in OpenGenerativeUI:

| Hook | Purpose |
|------|---------|
| \`useAgent()\` | Access agent state, send messages, check if agent is running |
| \`useComponent()\` | Register a React component the agent can render in chat |
| \`useFrontendTool()\` | Register a JS function the agent can call in the browser |
| \`useRenderTool()\` | Register a tool that renders UI while executing |
| \`useHumanInTheLoop()\` | Create async tools that pause for user input |`,
    },
    {
      type: "markdown",
      id: "hooks-useagent",
      content: `## useAgent()

The core hook. It gives you access to the agent's state and lets you interact with it:

- \`agent.state\` — The current agent state (typed by your AgentState schema)
- \`agent.setState()\` — Update the agent's state from the frontend
- \`agent.isRunning\` — Whether the agent is currently processing
- \`agent.sendMessage()\` — Send a message to the agent programmatically`,
    },
    {
      type: "code",
      id: "hooks-useagent-code",
      language: "tsx",
      filename: "Using useAgent()",
      content: `import { useAgent } from "@copilotkit/react-core";

function TodoCanvas() {
  const { agent } = useAgent();

  // Read state
  const todos = agent.state?.todos || [];

  // Write state (syncs to agent backend)
  const addTodo = (todo) => {
    agent.setState({ todos: [...todos, todo] });
  };

  // Check if agent is working
  if (agent.isRunning) {
    return <LoadingSpinner />;
  }

  return <TodoList todos={todos} onAdd={addTodo} />;
}`,
    },
    {
      type: "markdown",
      id: "hooks-usecomponent",
      content: `## useComponent()

Registers a React component as a tool the agent can call. When the agent calls this tool, instead of returning text, CopilotKit renders your component inline in the chat with the agent-provided props:`,
    },
    {
      type: "code",
      id: "hooks-usecomponent-code",
      language: "tsx",
      filename: "Registering a component tool",
      content: `import { useComponent } from "@copilotkit/react-core";
import { z } from "zod";

function MyChart({ title, data }) {
  return (
    <div>
      <h3>{title}</h3>
      {/* render chart with data */}
    </div>
  );
}

// In your hook setup:
useComponent("myChart", {
  component: MyChart,
  schema: z.object({
    title: z.string(),
    data: z.array(z.object({
      label: z.string(),
      value: z.number(),
    })),
  }),
  description: "Render a custom chart",
});`,
    },
    {
      type: "markdown",
      id: "hooks-usefrontendtool",
      content: `## useFrontendTool()

Registers a JavaScript function that the agent can call to perform actions in the browser. Unlike \`useComponent()\`, this doesn't render UI — it executes logic:`,
    },
    {
      type: "code",
      id: "hooks-usefrontendtool-code",
      language: "tsx",
      filename: "Frontend tool: theme toggle",
      content: `import { useFrontendTool } from "@copilotkit/react-core";

useFrontendTool("toggleTheme", {
  description: "Toggle between light and dark theme",
  schema: z.object({
    theme: z.enum(["light", "dark"]).describe("The theme to switch to"),
  }),
  handler: ({ theme }) => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    return \`Switched to \${theme} mode\`;
  },
});`,
    },
    {
      type: "playground",
      id: "hooks-playground",
      title: "Try it: Simulated Agent Hooks",
      files: {
        "/App.js": `import { useState, useCallback } from "react";

// Simulating what useAgent() provides
function useSimulatedAgent() {
  const [state, setState] = useState({
    todos: [
      { id: "1", title: "Read the docs", emoji: "📖", status: "pending" },
    ],
    theme: "light",
  });
  const [isRunning, setIsRunning] = useState(false);

  const simulateAgentAction = useCallback(async () => {
    setIsRunning(true);
    // Simulate agent thinking...
    await new Promise(r => setTimeout(r, 1500));
    setState(prev => ({
      ...prev,
      todos: [
        ...prev.todos,
        {
          id: String(Date.now()),
          title: "Agent-added task",
          emoji: "🤖",
          status: "pending",
        },
      ],
    }));
    setIsRunning(false);
  }, []);

  return { state, setState, isRunning, simulateAgentAction };
}

export default function App() {
  const { state, setState, isRunning, simulateAgentAction } = useSimulatedAgent();

  const toggleTodo = (id) => {
    setState(prev => ({
      ...prev,
      todos: prev.todos.map(t =>
        t.id === id
          ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
          : t
      ),
    }));
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
          Hook Simulation
        </h2>
        {isRunning && (
          <span style={{
            fontSize: 12, padding: "2px 8px", borderRadius: 12,
            background: "#BEC2FF", color: "#4a4a8a", fontWeight: 600,
          }}>
            Agent working...
          </span>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        {state.todos.map(t => (
          <div
            key={t.id}
            onClick={() => toggleTodo(t.id)}
            style={{
              padding: "10px 12px", marginBottom: 6, borderRadius: 8,
              background: t.status === "completed" ? "#f0fdf4" : "#fff",
              border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 14,
              textDecoration: t.status === "completed" ? "line-through" : "none",
            }}
          >
            {t.emoji} {t.title}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={simulateAgentAction}
          disabled={isRunning}
          style={{
            padding: "8px 16px", borderRadius: 8, border: "none",
            background: isRunning ? "#d1d5db" : "#9599CC",
            color: "#fff", cursor: isRunning ? "default" : "pointer",
            fontWeight: 600, fontSize: 13,
          }}
        >
          {isRunning ? "Thinking..." : "Simulate Agent Action"}
        </button>
        <button
          onClick={() => setState(prev => ({
            ...prev,
            todos: [...prev.todos, {
              id: String(Date.now()),
              title: "User-added task",
              emoji: "👤",
              status: "pending",
            }],
          }))}
          style={{
            padding: "8px 16px", borderRadius: 8, fontWeight: 600,
            background: "#85E0CE", color: "#0a4a3a", border: "none",
            cursor: "pointer", fontSize: 13,
          }}
        >
          User Adds Todo
        </button>
      </div>

      <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 12 }}>
        Both buttons modify the same state — just like agent.setState() and user interactions do in the real app.
      </p>
    </div>
  );
}`,
      },
    },
  ],
};
