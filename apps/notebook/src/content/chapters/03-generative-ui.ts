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
      content: `import { CopilotRuntime, LangGraphHttpAgent } from "@copilotkit/runtime";

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

The playground below is a working simulation of these hooks — the "agent" picks tools, and the corresponding React components render live in a chat-like stream:`,
    },
    {
      type: "playground",
      id: "ck-hooks-playground",
      title: "Live: Agent calls component tools, React renders them",
      dependencies: { recharts: "2.12.7" },
      files: {
        "/App.js": `import { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

// Registered component tools — same concept as useComponent()
const componentTools = {
  pieChart: ({ title, data }) => (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>{title}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart><Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={70} strokeWidth={2}>
          {data.map((_, i) => <Cell key={i} fill={["#5B3FA0","#0F6E56","#2663B3","#C44D4D","#B8860B"][i % 5]} />)}
        </Pie></PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: ["#5B3FA0","#0F6E56","#2663B3","#C44D4D","#B8860B"][i % 5] }} />
            {d.label}: {d.value}
          </span>
        ))}
      </div>
    </div>
  ),
  barChart: ({ title, data }) => (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px" }}>{title}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}><XAxis dataKey="label" tick={{fontSize: 11}} /><YAxis tick={{fontSize: 11}} />
          <Tooltip /><Bar dataKey="value" radius={[4,4,0,0]}>
            {data.map((_, i) => <Cell key={i} fill={["#5B3FA0","#0F6E56","#2663B3","#C44D4D"][i % 4]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  ),
  widgetRenderer: ({ title, html }) => (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
      <div style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>{title}</div>
      <div dangerouslySetInnerHTML={{ __html: html }} style={{ padding: 16 }} />
    </div>
  ),
};

// Simulated agent tool calls with real data
const agentActions = [
  { type: "text", content: "Let me show you the project stats." },
  {
    type: "tool", tool: "pieChart", args: {
      title: "Languages in Codebase",
      data: [{ label: "TypeScript", value: 45 }, { label: "Python", value: 30 }, { label: "CSS", value: 15 }, { label: "Other", value: 10 }],
    },
  },
  { type: "text", content: "And here's the weekly activity:" },
  {
    type: "tool", tool: "barChart", args: {
      title: "Commits This Week",
      data: [{ label: "Mon", value: 12 }, { label: "Tue", value: 8 }, { label: "Wed", value: 15 }, { label: "Thu", value: 6 }, { label: "Fri", value: 19 }],
    },
  },
  { type: "text", content: "I can also render arbitrary HTML via the widget renderer:" },
  {
    type: "tool", tool: "widgetRenderer", args: {
      title: "Status Indicators",
      html: '<div style="display:flex;gap:12px;font-family:system-ui"><div style="padding:12px 16px;border-radius:8px;background:#EAF3DE;border:0.5px solid rgba(0,0,0,0.1)"><div style="font-size:11px;color:#3B6D11">Uptime</div><div style="font-size:22px;font-weight:500;color:#3B6D11">99.9%</div></div><div style="padding:12px 16px;border-radius:8px;background:#E6F1FB;border:0.5px solid rgba(0,0,0,0.1)"><div style="font-size:11px;color:#185FA5">Latency</div><div style="font-size:22px;font-weight:500;color:#185FA5">42ms</div></div><div style="padding:12px 16px;border-radius:8px;background:#FAEEDA;border:0.5px solid rgba(0,0,0,0.1)"><div style="font-size:11px;color:#854F0B">Queue</div><div style="font-size:22px;font-weight:500;color:#854F0B">7</div></div></div>',
    },
  },
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [running, setRunning] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const run = async () => {
    setMessages([]);
    setRunning(true);
    for (const action of agentActions) {
      await new Promise(r => setTimeout(r, 900));
      setMessages(prev => [...prev, action]);
    }
    setRunning(false);
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", height: 480 }}>
      {/* Chat stream */}
      <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && !running && (
          <div style={{ textAlign: "center", color: "#9ca3af", marginTop: 40, fontSize: 14 }}>
            Click "Run Agent" to see component tools render live
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.type === "text" ? (
              <div style={{ padding: "8px 12px", borderRadius: 8, background: "#f9fafb", fontSize: 14, color: "#374151", maxWidth: "85%" }}>
                {msg.content}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "#5B3FA0", marginBottom: 4 }}>
                  useComponent("{msg.tool}") renders:
                </div>
                {componentTools[msg.tool](msg.args)}
              </div>
            )}
          </div>
        ))}
        {running && (
          <div style={{ fontSize: 13, color: "#5B3FA0", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5B3FA0", animation: "pulse 1s infinite" }} />
            Agent is thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <style>{"@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }"}</style>

      {/* Controls */}
      <div style={{ padding: 12, borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
        <button onClick={run} disabled={running} style={{
          flex: 1, padding: "10px", borderRadius: 8, border: "none",
          background: running ? "#e5e7eb" : "#5B3FA0", color: running ? "#9ca3af" : "#fff",
          cursor: running ? "default" : "pointer", fontWeight: 600, fontSize: 14,
        }}>
          {running ? "Running..." : "Run Agent"}
        </button>
      </div>
    </div>
  );
}`,
      },
    },
    {
      type: "markdown",
      id: "ck-state-sync",
      content: `## useAgent() — Bidirectional State Sync

The \`useAgent()\` hook gives the frontend direct access to the agent's state. Both user and agent can modify the same state:`,
    },
    {
      type: "playground",
      id: "ck-state-playground",
      title: "Live: Bidirectional state sync (user + agent modify same todos)",
      files: {
        "/App.js": `import { useState, useCallback } from "react";

// Simulates useAgent() — both sides write to the same state
export default function App() {
  const [todos, setTodos] = useState([
    { id: "1", title: "Set up CopilotKit provider", emoji: "🔌", status: "completed" },
    { id: "2", title: "Register component tools", emoji: "🪝", status: "completed" },
    { id: "3", title: "Write agent system prompt", emoji: "📝", status: "pending" },
  ]);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [lastAction, setLastAction] = useState("");

  // User action: toggle todo status
  const userToggle = (id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, status: t.status === "completed" ? "pending" : "completed" } : t));
    setLastAction("user: agent.setState({ todos: [...] })");
  };

  // User action: add todo
  const userAdd = () => {
    const newTodo = { id: String(Date.now()), title: "User-created task", emoji: "👤", status: "pending" };
    setTodos(prev => [...prev, newTodo]);
    setLastAction("user: agent.setState({ todos: [...todos, newTodo] })");
  };

  // Agent action: adds organized todos via manage_todos tool
  const agentAction = useCallback(async () => {
    setIsAgentRunning(true);
    setLastAction("agent: calling manage_todos tool...");
    await new Promise(r => setTimeout(r, 600));
    setLastAction("agent: plan_visualization → approach: 'organize by priority'");
    await new Promise(r => setTimeout(r, 800));

    setTodos(prev => {
      const organized = [
        ...prev.filter(t => t.status === "pending"),
        { id: String(Date.now()), title: "Deploy to production", emoji: "🚀", status: "pending" },
        { id: String(Date.now()+1), title: "Write skill playbook", emoji: "📜", status: "pending" },
        ...prev.filter(t => t.status === "completed"),
      ];
      return organized;
    });
    setLastAction("agent: Command(update={ todos: [...sorted, ...newTodos] })");
    setIsAgentRunning(false);
  }, []);

  const pending = todos.filter(t => t.status === "pending");
  const done = todos.filter(t => t.status === "completed");

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 16 }}>
      {/* State sync indicator */}
      <div style={{
        padding: "6px 12px", borderRadius: 8, fontSize: 11, fontFamily: "monospace",
        background: lastAction.startsWith("agent") ? "#E3EFFC" : lastAction.startsWith("user") ? "#EAF3DE" : "#f9fafb",
        color: lastAction.startsWith("agent") ? "#1A4680" : lastAction.startsWith("user") ? "#3B6D11" : "#9ca3af",
        marginBottom: 12, transition: "all 0.3s",
      }}>
        {lastAction || "State: idle — try clicking a todo or running the agent"}
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {/* Pending column */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>
            Pending ({pending.length})
          </div>
          {pending.map(t => (
            <div key={t.id} onClick={() => userToggle(t.id)} style={{
              padding: "8px 12px", marginBottom: 6, borderRadius: 8, cursor: "pointer",
              background: "#fff", border: "1px solid #e5e7eb", fontSize: 13,
              transition: "transform 0.15s", display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ width: 16, height: 16, borderRadius: 4, border: "1.5px solid #d1d5db", flexShrink: 0 }} />
              <span>{t.emoji} {t.title}</span>
            </div>
          ))}
        </div>
        {/* Done column */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>
            Done ({done.length})
          </div>
          {done.map(t => (
            <div key={t.id} onClick={() => userToggle(t.id)} style={{
              padding: "8px 12px", marginBottom: 6, borderRadius: 8, cursor: "pointer",
              background: "#f0fdf4", border: "1px solid #d1fae5", fontSize: 13, opacity: 0.8,
              textDecoration: "line-through", display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ width: 16, height: 16, borderRadius: 4, background: "#0F6E56", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" fill="none" stroke="#fff" strokeWidth="2"/></svg>
              </span>
              <span>{t.emoji} {t.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={userAdd} style={{
          padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db",
          background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 12, color: "#374151",
        }}>
          + User adds todo
        </button>
        <button onClick={agentAction} disabled={isAgentRunning} style={{
          padding: "8px 14px", borderRadius: 8, border: "none",
          background: isAgentRunning ? "#e5e7eb" : "#5B3FA0", color: isAgentRunning ? "#9ca3af" : "#fff",
          cursor: isAgentRunning ? "default" : "pointer", fontWeight: 600, fontSize: 12,
        }}>
          {isAgentRunning ? "Agent working..." : "Agent: organize + add tasks"}
        </button>
      </div>
    </div>
  );
}`,
      },
    },
  ],
};
