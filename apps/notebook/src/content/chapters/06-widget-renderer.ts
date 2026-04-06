import type { Chapter } from "@/lib/types";

export const fullFlow: Chapter = {
  id: "full-flow",
  title: "Putting It Together",
  description:
    "The complete end-to-end flow from user message to rendered visualization.",
  icon: "🔗",
  cells: [
    {
      type: "markdown",
      id: "flow-overview",
      content: `# Putting It Together

Now that you've seen each layer, let's trace the **complete flow** from a user message to a rendered visualization.

## End-to-End: "Show me a solar system"

| Step | Layer | What happens |
|------|-------|-------------|
| 1 | **Frontend** | User types "Show me a solar system" in CopilotKit chat |
| 2 | **CopilotKit** | \`CopilotRuntime\` sends message to LangGraph agent via \`LangGraphHttpAgent\` |
| 3 | **Deep Agent** | Agent acknowledges: "I'll create an interactive solar system for you." |
| 4 | **Deep Agent** | Agent calls \`plan_visualization(approach="3D orbital simulation", technology="Three.js", ...)\` |
| 5 | **CopilotKit** | \`useRenderTool("plan_visualization")\` renders \`<PlanCard>\` in the chat stream |
| 6 | **Deep Agent** | Agent calls \`widgetRenderer({ title: "Solar System", html: "<div>..." })\` |
| 7 | **CopilotKit** | \`useComponent("widgetRenderer")\` renders \`<WidgetRenderer>\` component |
| 8 | **Widget Renderer** | Empty iframe shell assembled (Theme CSS + Bridge JS + Import Map) |
| 9 | **Widget Renderer** | HTML streamed via \`postMessage\` → Idiomorph morphs the DOM |
| 10 | **Widget Renderer** | \`<script type="module">\` loads Three.js from import map, creates scene |
| 11 | **Widget Renderer** | Auto-resize reports final height → iframe fits content |
| 12 | **Deep Agent** | Agent narrates: "The visualization shows planets orbiting the sun..." |`,
    },
    {
      type: "markdown",
      id: "flow-mcp-path",
      content: `## MCP Skill Integration Path

When the CopilotKit runtime has an MCP server configured, skills enhance the agent's output quality:

1. Runtime connects to MCP server at startup (\`mcpApps.servers\` config)
2. Agent can read skill resources (\`skills://master-agent-playbook\`)
3. Agent follows skill rules: response decision tree, 3-layer pattern, SVG rules
4. For external tools (Claude Desktop, Cursor), the MCP server also exposes:
   - **Prompts**: Pre-composed skill instructions (\`create_widget\`, \`create_svg_diagram\`)
   - **Tools**: \`assemble_document\` wraps HTML with the full design system

The skills layer is what ensures consistent visual quality — without it, the agent would produce inconsistent styling and miss design system variables.`,
    },
    {
      type: "markdown",
      id: "flow-state-sync",
      content: `## State Sync Flow

For todo interactions, the state flows bidirectionally:

**User edits a todo:**
1. User clicks checkbox → \`agent.setState({ todos: updatedList })\`
2. CopilotKit syncs new state to LangGraph agent backend
3. Agent sees the update in its next tool call via \`runtime.state.todos\`

**Agent adds a todo:**
1. Agent calls \`manage_todos([...existingTodos, newTodo])\`
2. LangGraph \`Command(update={todos: [...]})\` updates agent state
3. CopilotKit syncs back to frontend → \`agent.state.todos\` updates
4. React re-renders the todo list

Both directions use the same state object — there's no separate frontend vs. backend state.`,
    },
    {
      type: "code",
      id: "flow-config",
      language: "typescript",
      filename: "Complete CopilotKit runtime configuration",
      content: `// apps/app/src/app/api/copilotkit/route.ts
const defaultAgent = new LangGraphHttpAgent({
  deploymentUrl: process.env.LANGGRAPH_DEPLOYMENT_URL || "http://localhost:8123",
  agentName: "sample_agent",
});

const runtime = new CopilotRuntime({
  agents: { default: defaultAgent },
  a2ui: { injectA2UITool: true },
  mcpApps: {
    servers: process.env.MCP_SERVER_URL ? [{
      type: "http",
      url: process.env.MCP_SERVER_URL,
      serverId: "example_mcp_app",
    }] : [],
  },
});

// apps/agent/main.py
agent = create_deep_agent(
    model=ChatOpenAI(model="gpt-5.4-2026-03-05"),
    tools=[query_data, plan_visualization, *todo_tools, generate_form],
    middleware=[CopilotKitMiddleware()],
    context_schema=AgentState,
    skills=[str(Path(__file__).parent / "skills")],
    checkpointer=BoundedMemorySaver(max_threads=200),
    system_prompt="...",
)`,
    },
    {
      type: "playground",
      id: "flow-playground",
      title: "Try it: Full Pipeline Simulation",
      files: {
        "/App.js": `import { useState, useEffect } from "react";

// Simulates the complete end-to-end flow
const pipeline = [
  { layer: "Frontend", action: "User sends message", detail: '"Show me a solar system"', icon: "💬" },
  { layer: "CopilotKit", action: "Routes to LangGraph agent", detail: "POST /api/copilotkit → localhost:8123", icon: "🔌" },
  { layer: "Deep Agent", action: "Acknowledges request", detail: '"I\'ll create an interactive solar system visualization."', icon: "🧠" },
  { layer: "Deep Agent", action: "Calls plan_visualization", detail: "approach: '3D orbital sim', tech: 'Three.js'", icon: "📋" },
  { layer: "CopilotKit", action: "Renders PlanCard", detail: "useRenderTool renders component in chat", icon: "🔌" },
  { layer: "Deep Agent", action: "Calls widgetRenderer", detail: "html: '<div id=\\"scene\\">...</div><script type=\\"module\\">...'", icon: "🧠" },
  { layer: "Widget Renderer", action: "Assembles iframe shell", detail: "Theme CSS + Bridge JS + Import Map", icon: "🖼" },
  { layer: "Widget Renderer", action: "Streams HTML via postMessage", detail: "Idiomorph morphs DOM, scripts execute sequentially", icon: "🖼" },
  { layer: "Widget Renderer", action: "Auto-resize complete", detail: "Height: 450px, streaming settled", icon: "🖼" },
  { layer: "Deep Agent", action: "Narrates result", detail: '"The visualization shows planets orbiting..."', icon: "🧠" },
];

const layerColors = {
  "Frontend":        { bg: "#f0fdf4", border: "#a7f3d0", text: "#166534" },
  "CopilotKit":      { bg: "#f5f3ff", border: "#c4b5fd", text: "#5b21b6" },
  "Deep Agent":      { bg: "#eff6ff", border: "#93c5fd", text: "#1e40af" },
  "Widget Renderer": { bg: "#fff7ed", border: "#fdba74", text: "#9a3412" },
};

export default function App() {
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setStep(-1);
    for (let i = 0; i < pipeline.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      setStep(i);
    }
    setRunning(false);
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 20 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
        End-to-End Flow
      </h2>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
        Watch a user message flow through all four layers.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
        {pipeline.map((s, i) => {
          const active = i <= step;
          const c = layerColors[s.layer];
          return (
            <div key={i} style={{
              display: "flex", gap: 10, padding: "8px 12px", borderRadius: 8,
              background: active ? c.bg : "#fafafa",
              border: \`1px solid \${active ? c.border : "#f0f0f0"}\`,
              opacity: active ? 1 : 0.3,
              transition: "all 0.3s ease",
              fontSize: 13,
            }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: active ? c.text : "#9ca3af" }}>
                  {s.layer}: {s.action}
                </div>
                <div style={{
                  fontSize: 11, fontFamily: "monospace",
                  color: active ? "#6b7280" : "#d1d5db", marginTop: 2,
                }}>
                  {s.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={run} disabled={running} style={{
        padding: "8px 16px", borderRadius: 8, border: "none",
        background: running ? "#d1d5db" : "linear-gradient(135deg, #9599CC, #1B936F)",
        color: "#fff", cursor: running ? "default" : "pointer",
        fontWeight: 600, fontSize: 13,
      }}>
        {running ? "Running..." : "Trace Full Pipeline"}
      </button>
    </div>
  );
}`,
      },
    },
    {
      type: "markdown",
      id: "flow-extend",
      content: `## Extending the Template

To add your own domain to OpenGenerativeUI:

1. **Define state** — Add fields to \`AgentState\` in \`todos.py\` (or create a new schema)
2. **Create tools** — Write LangGraph tools that return \`Command(update={...})\` to modify state
3. **Register components** — Use \`useComponent()\` in the frontend to register UI for agent tool calls
4. **Write skills** — Add \`.txt\` playbooks to guide the agent's visual output quality
5. **Configure the system prompt** — Define your mandatory workflow steps

The todo list is the starting point — replace it with your domain (project tracker, inventory, scheduling, etc.) while keeping the same CopilotKit v2 state pattern.`,
    },
  ],
};
