import type { Chapter } from "@/lib/types";

export const copilotKitIntegration: Chapter = {
  id: "copilotkit",
  title: "CopilotKit Integration",
  description:
    "How React hooks bridge the frontend to the AI agent.",
  icon: "🔌",
  cells: [
    {
      type: "markdown",
      id: "ck-overview",
      content: `# CopilotKit Integration

CopilotKit provides the bridge between the React frontend and the LangGraph agent. It works through three layers:

1. **Provider** — \`<CopilotKit runtimeUrl="/api/copilotkit">\` wraps the app
2. **Runtime** — A Next.js API route that connects to the LangGraph agent via \`LangGraphHttpAgent\`
3. **Hooks** — React hooks that register component tools, frontend tools, and render tools

The key insight: CopilotKit lets you register **React components as agent tools**. When the agent calls a tool like \`widgetRenderer\`, instead of returning text, CopilotKit renders your component inline in the chat.`,
    },
    {
      type: "code",
      id: "ck-runtime",
      language: "typescript",
      filename: "apps/app/src/app/api/copilotkit/route.ts",
      content: `import { CopilotRuntime } from "@copilotkit/runtime";
import { LangGraphHttpAgent } from "@copilotkit/runtime";

// Connect to the LangGraph agent backend
const defaultAgent = new LangGraphHttpAgent({
  deploymentUrl: process.env.LANGGRAPH_DEPLOYMENT_URL || "http://localhost:8123",
  agentName: "sample_agent",
});

const runtime = new CopilotRuntime({
  agents: { default: defaultAgent },

  // Auto-inject A2UI (Agent-to-UI) tool
  a2ui: { injectA2UITool: true },

  // Optional: connect MCP server for skills
  mcpApps: {
    servers: process.env.MCP_SERVER_URL ? [{
      type: "http",
      url: process.env.MCP_SERVER_URL,
      serverId: "example_mcp_app",
    }] : [],
  },
});`,
    },
    {
      type: "markdown",
      id: "ck-hooks-intro",
      content: `## Hook Registration

All CopilotKit hooks are registered in a single custom hook. Here's the full set used in OpenGenerativeUI:

| Hook | Name | What it does |
|------|------|-------------|
| \`useComponent()\` | \`pieChart\` | Registers PieChart as a renderable tool |
| \`useComponent()\` | \`barChart\` | Registers BarChart as a renderable tool |
| \`useComponent()\` | \`widgetRenderer\` | Registers the iframe widget renderer |
| \`useFrontendTool()\` | \`toggleTheme\` | Agent can switch light/dark mode |
| \`useRenderTool()\` | \`plan_visualization\` | Shows PlanCard while agent plans |
| \`useHumanInTheLoop()\` | \`scheduleTime\` | Pauses for user to pick a meeting time |
| \`useDefaultRenderTool()\` | (all tools) | Shows reasoning indicator for any tool |`,
    },
    {
      type: "code",
      id: "ck-hooks-code",
      language: "tsx",
      filename: "apps/app/src/hooks/use-generative-ui-examples.tsx",
      content: `import { useComponent, useFrontendTool, useRenderTool,
         useDefaultRenderTool, useHumanInTheLoop } from "@copilotkit/react-core";

export function useGenerativeUIExamples() {
  // 1. Component tools — agent renders these in the chat stream
  useComponent("pieChart", {
    component: PieChart,
    schema: PieChartProps,  // Zod schema → agent sees as tool params
    description: "Render a pie chart with labeled data segments",
  });

  useComponent("widgetRenderer", {
    component: WidgetRenderer,
    schema: z.object({
      title: z.string(),
      description: z.string(),
      html: z.string().describe("Self-contained HTML with inline styles and scripts"),
    }),
    description: "Render interactive HTML/SVG/3D visualizations in a sandboxed iframe",
  });

  // 2. Frontend tool — agent calls JS in the browser (no UI)
  const { setTheme } = useTheme();
  useFrontendTool("toggleTheme", {
    description: "Toggle between light and dark mode",
    schema: z.object({}),
    handler: () => {
      setTheme(currentTheme === "dark" ? "light" : "dark");
      return "Theme toggled";
    },
  });

  // 3. Render tool — runs logic AND shows UI during execution
  useRenderTool("plan_visualization", {
    description: "Show planning progress before building a visualization",
    schema: z.object({
      status: z.string(),
      approach: z.string(),
      technology: z.string(),
      keyElements: z.array(z.string()),
    }),
    component: PlanCard,  // Shows while the tool executes
    handler: (props) => \`Plan: \${props.approach}\`,
  });

  // 4. Human-in-the-loop — pauses agent, waits for user input
  useHumanInTheLoop("scheduleTime", {
    description: "Schedule a meeting time with the user",
    schema: z.object({
      reasonForScheduling: z.string(),
      meetingDuration: z.string(),
    }),
    component: MeetingTimePicker,  // User picks a time, then agent resumes
  });

  // 5. Default render tool — shows reasoning for ALL tool calls
  useDefaultRenderTool({
    component: ToolReasoning,
    excludeTools: ["generate_form"],
  });
}`,
    },
    {
      type: "markdown",
      id: "ck-useagent",
      content: `## useAgent() — Reading and Writing Agent State

The \`useAgent()\` hook gives the frontend direct access to the agent's state. In OpenGenerativeUI, this powers the todo canvas:

- \`agent.state.todos\` — Read the current todo list
- \`agent.setState({ todos: [...] })\` — Update from the frontend
- \`agent.isRunning\` — Shows loading state while agent processes

Both user edits and agent tool calls modify the same state. CopilotKit handles the bidirectional sync automatically.`,
    },
    {
      type: "code",
      id: "ck-canvas",
      language: "tsx",
      filename: "apps/app/src/components/canvas/index.tsx",
      content: `import { useAgent } from "@copilotkit/react-core";

export function Canvas() {
  const { agent } = useAgent();

  return (
    <TodoList
      // Read from agent state
      todos={agent.state?.todos || []}
      // Write to agent state (syncs to backend)
      onUpdate={(updated) => agent.setState({ todos: updated })}
      // React to agent activity
      isAgentRunning={agent.isRunning}
    />
  );
}`,
    },
    {
      type: "playground",
      id: "ck-playground",
      title: "Try it: Component Tool Registration",
      files: {
        "/App.js": `import { useState } from "react";

// Simulating how useComponent() works:
// The agent calls "renderCard" with props → CopilotKit renders the component

function AgentCard({ title, items, color }) {
  return (
    <div style={{
      padding: 16, borderRadius: 12, fontFamily: "system-ui, sans-serif",
      background: color === "mint" ? "#f0fdf4" : "#f5f3ff",
      border: \`1px solid \${color === "mint" ? "#a7f3d0" : "#c4b5fd"}\`,
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px 0" }}>{title}</h3>
      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.8 }}>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
}

// Simulated tool calls from the agent
const toolCalls = [
  {
    name: "renderCard",
    args: {
      title: "Frontend Stack",
      items: ["Next.js 16 with Turbopack", "React 19", "TailwindCSS 4", "CopilotKit v2 hooks"],
      color: "lilac",
    },
  },
  {
    name: "renderCard",
    args: {
      title: "Agent Stack",
      items: ["LangGraph (Python)", "create_deep_agent", "CopilotKitMiddleware", "BoundedMemorySaver"],
      color: "mint",
    },
  },
];

export default function App() {
  const [rendered, setRendered] = useState([]);
  const [calling, setCalling] = useState(false);

  const simulateAgent = async () => {
    setCalling(true);
    for (const call of toolCalls) {
      await new Promise(r => setTimeout(r, 800));
      setRendered(prev => [...prev, call]);
    }
    setCalling(false);
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 20 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
        useComponent() Simulation
      </h2>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
        When the agent calls a component tool, CopilotKit renders the React component inline:
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        {rendered.map((call, i) => (
          <div key={i}>
            <div style={{
              fontSize: 11, fontFamily: "monospace", color: "#9599CC",
              marginBottom: 4,
            }}>
              agent calls: {call.name}({JSON.stringify(call.args).slice(0, 60)}...)
            </div>
            <AgentCard {...call.args} />
          </div>
        ))}
      </div>

      <button
        onClick={simulateAgent}
        disabled={calling}
        style={{
          padding: "8px 16px", borderRadius: 8, border: "none",
          background: calling ? "#d1d5db" : "#9599CC", color: "#fff",
          cursor: calling ? "default" : "pointer", fontWeight: 600, fontSize: 13,
        }}
      >
        {calling ? "Agent rendering..." : "Simulate Agent Tool Calls"}
      </button>
    </div>
  );
}`,
      },
    },
  ],
};
