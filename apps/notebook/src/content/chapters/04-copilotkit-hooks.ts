import type { Chapter } from "@/lib/types";

export const deepAgent: Chapter = {
  id: "deep-agent",
  title: "Deep Agent",
  description:
    "The LangGraph agent: create_deep_agent, tools, state, and memory.",
  icon: "🧠",
  cells: [
    {
      type: "markdown",
      id: "da-overview",
      content: `# The Deep Agent

The agent backend uses \`create_deep_agent\` from the \`deepagents\` library — a LangGraph-based agent factory that supports tools, middleware, skills, and bounded memory.`,
    },
    {
      type: "code",
      id: "da-main",
      language: "python",
      filename: "apps/agent/main.py",
      content: `from deepagents import create_deep_agent
from copilotkit import CopilotKitMiddleware, LangGraphAGUIAgent
from langchain_openai import ChatOpenAI

agent = create_deep_agent(
    model=ChatOpenAI(model=os.environ.get("LLM_MODEL", "gpt-5.4-2026-03-05")),
    tools=[query_data, plan_visualization, *todo_tools, generate_form],
    middleware=[CopilotKitMiddleware()],
    context_schema=AgentState,
    skills=[str(Path(__file__).parent / "skills")],
    checkpointer=BoundedMemorySaver(max_threads=200),
    system_prompt="...",
)`,
    },
    {
      type: "code",
      id: "da-tools-code",
      language: "python",
      filename: "apps/agent/src/todos.py — manage_todos",
      content: `@tool
def manage_todos(todos: list[Todo], runtime: ToolRuntime) -> Command:
    """Manage the current todos."""
    for todo in todos:
        if "id" not in todo or not todo["id"]:
            todo["id"] = str(uuid.uuid4())

    return Command(update={
        "todos": todos,
        "messages": [ToolMessage(
            content="Successfully updated todos",
            tool_call_id=runtime.tool_call_id
        )]
    })`,
    },
    {
      type: "markdown",
      id: "da-workflow",
      content: `## Mandatory Visualization Workflow

The system prompt enforces a strict 4-step pipeline for every visual response. The playground below runs a real simulation — watch the agent execute each tool, produce actual output, and render the final widget:`,
    },
    {
      type: "playground",
      id: "da-pipeline-playground",
      title: "Live: Full agent tool execution pipeline with rendered output",
      files: {
        "/App.js": `import { useState, useRef, useEffect } from "react";

// Full agent pipeline simulation that ACTUALLY RENDERS the visualization

export default function App() {
  const [phase, setPhase] = useState("idle"); // idle, ack, plan, build, narrate, done
  const [chatLog, setChatLog] = useState([]);
  const [widgetHtml, setWidgetHtml] = useState("");
  const iframeRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatLog, widgetHtml]);

  // Update iframe when widget HTML is set
  useEffect(() => {
    if (!iframeRef.current || !widgetHtml) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(\`<!DOCTYPE html><html><body style="margin:0">\${widgetHtml}</body></html>\`);
    doc.close();
  }, [widgetHtml]);

  const runPipeline = async () => {
    setChatLog([]);
    setWidgetHtml("");

    // Step 1: Acknowledge
    setPhase("ack");
    await new Promise(r => setTimeout(r, 600));
    setChatLog(prev => [...prev, {
      type: "text",
      content: "I'll create an interactive metrics dashboard showing the agent's tool usage and performance data.",
    }]);

    // Step 2: Plan
    setPhase("plan");
    await new Promise(r => setTimeout(r, 800));
    setChatLog(prev => [...prev, {
      type: "plan",
      data: {
        approach: "Multi-card dashboard with animated bar chart and live metric counters",
        technology: "HTML + CSS (no dependencies)",
        keyElements: [
          "Metrics cards row with tool call count, latency, success rate",
          "Horizontal bar chart showing tool usage distribution",
          "Animated entrance transitions",
          "Design system CSS variables for theming",
        ],
      },
    }]);

    // Step 3: Build (stream the actual widget)
    setPhase("build");
    await new Promise(r => setTimeout(r, 500));
    setChatLog(prev => [...prev, { type: "building" }]);

    const widgetContent = \`<style>
      body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; margin: 0; background: #fff; }
      .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
      .metric-card { padding: 14px; border-radius: 12px; border: 0.5px solid rgba(0,0,0,0.12); }
      .metric-label { font-size: 11px; color: #73726c; margin-bottom: 4px; }
      .metric-value { font-size: 24px; font-weight: 500; }
      .bar-section { margin-top: 8px; }
      .bar-title { font-size: 14px; font-weight: 500; color: #1a1a1a; margin-bottom: 12px; }
      .bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
      .bar-label { width: 100px; font-size: 12px; color: #73726c; text-align: right; }
      .bar-track { flex: 1; height: 24px; background: #f7f6f3; border-radius: 6px; overflow: hidden; }
      .bar-fill { height: 100%; border-radius: 6px; animation: grow 1s ease-out forwards; transform-origin: left; }
      .bar-pct { width: 36px; font-size: 12px; color: #73726c; }
      @keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .animate { animation: fadeUp 0.5s ease-out forwards; opacity: 0; }
    </style>
    <div class="grid">
      <div class="metric-card animate" style="background:#EDE9F5;animation-delay:0.1s">
        <div class="metric-label">Tool calls</div>
        <div class="metric-value" style="color:#5B3FA0">1,247</div>
      </div>
      <div class="metric-card animate" style="background:#E1F5EE;animation-delay:0.2s">
        <div class="metric-label">Avg latency</div>
        <div class="metric-value" style="color:#0F6E56">340ms</div>
      </div>
      <div class="metric-card animate" style="background:#E3EFFC;animation-delay:0.3s">
        <div class="metric-label">Success rate</div>
        <div class="metric-value" style="color:#2663B3">99.2%</div>
      </div>
      <div class="metric-card animate" style="background:#FEF3DC;animation-delay:0.4s">
        <div class="metric-label">Active threads</div>
        <div class="metric-value" style="color:#B8860B">42</div>
      </div>
    </div>
    <div class="bar-section animate" style="animation-delay:0.6s">
      <div class="bar-title">Tool usage breakdown</div>
      <div class="bar-row"><span class="bar-label">widgetRenderer</span><div class="bar-track"><div class="bar-fill" style="width:78%;background:#5B3FA0;animation-delay:0.8s"></div></div><span class="bar-pct">78%</span></div>
      <div class="bar-row"><span class="bar-label">pieChart</span><div class="bar-track"><div class="bar-fill" style="width:52%;background:#0F6E56;animation-delay:0.9s"></div></div><span class="bar-pct">52%</span></div>
      <div class="bar-row"><span class="bar-label">manage_todos</span><div class="bar-track"><div class="bar-fill" style="width:35%;background:#2663B3;animation-delay:1.0s"></div></div><span class="bar-pct">35%</span></div>
      <div class="bar-row"><span class="bar-label">query_data</span><div class="bar-track"><div class="bar-fill" style="width:20%;background:#C44D4D;animation-delay:1.1s"></div></div><span class="bar-pct">20%</span></div>
      <div class="bar-row"><span class="bar-label">plan_viz</span><div class="bar-track"><div class="bar-fill" style="width:95%;background:#B8860B;animation-delay:1.2s"></div></div><span class="bar-pct">95%</span></div>
    </div>\`;
    await new Promise(r => setTimeout(r, 400));
    setWidgetHtml(widgetContent);

    // Step 4: Narrate
    setPhase("narrate");
    await new Promise(r => setTimeout(r, 1200));
    setChatLog(prev => [...prev, {
      type: "text",
      content: "The dashboard shows the agent has handled 1,247 tool calls with a 99.2% success rate. The widgetRenderer is the most-used tool at 78%, followed by charts at 52%. Notice that plan_visualization runs at 95% — nearly every visual response includes a planning step.",
    }]);
    setPhase("done");
  };

  const phaseLabel = { idle: "", ack: "Acknowledging...", plan: "Planning...", build: "Building widget...", narrate: "Narrating...", done: "Complete" };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", height: 560 }}>
      <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {chatLog.length === 0 && phase === "idle" && (
          <div style={{ textAlign: "center", color: "#9ca3af", marginTop: 60, fontSize: 14 }}>
            Click "Run Pipeline" to execute the full Acknowledge → Plan → Build → Narrate workflow
          </div>
        )}

        {chatLog.map((msg, i) => {
          if (msg.type === "text") return (
            <div key={i} style={{ padding: "10px 14px", borderRadius: 10, background: "#f9fafb", fontSize: 13, color: "#374151", maxWidth: "90%", lineHeight: 1.5 }}>
              {msg.content}
            </div>
          );
          if (msg.type === "plan") return (
            <div key={i} style={{ padding: 14, borderRadius: 10, background: "#EDE9F5", border: "1px solid #c4b5fd", maxWidth: "90%" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#5B3FA0", textTransform: "uppercase", marginBottom: 6 }}>Plan</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#3E2B6F", marginBottom: 2 }}>{msg.data.approach}</div>
              <div style={{ fontSize: 11, color: "#5B3FA0", marginBottom: 6 }}>Tech: {msg.data.technology}</div>
              {msg.data.keyElements.map((el, j) => (
                <div key={j} style={{ fontSize: 12, color: "#3E2B6F", paddingLeft: 12, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0 }}>-</span> {el}
                </div>
              ))}
            </div>
          );
          if (msg.type === "building") return null;
          return null;
        })}

        {/* The actual rendered widget */}
        {widgetHtml && (
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb" }}>
            <div style={{ padding: "6px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 11, color: "#5B3FA0", fontWeight: 600 }}>
              widgetRenderer output:
            </div>
            <iframe
              ref={iframeRef}
              sandbox="allow-scripts"
              style={{ width: "100%", height: 280, border: "none", display: "block" }}
            />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={{ padding: 12, borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={runPipeline} disabled={phase !== "idle" && phase !== "done"} style={{
          padding: "10px 20px", borderRadius: 8, border: "none",
          background: (phase !== "idle" && phase !== "done") ? "#e5e7eb" : "#5B3FA0",
          color: (phase !== "idle" && phase !== "done") ? "#9ca3af" : "#fff",
          cursor: (phase !== "idle" && phase !== "done") ? "default" : "pointer",
          fontWeight: 600, fontSize: 14,
        }}>
          {phase === "done" ? "Run Again" : phase === "idle" ? "Run Pipeline" : phaseLabel[phase]}
        </button>
        {phase !== "idle" && (
          <div style={{ display: "flex", gap: 4 }}>
            {["ack","plan","build","narrate"].map((p, i) => (
              <div key={p} style={{
                padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 600,
                background: phase === p ? "#5B3FA0" : (["ack","plan","build","narrate"].indexOf(phase) > i || phase === "done") ? "#E1F5EE" : "#f0f0f0",
                color: phase === p ? "#fff" : (["ack","plan","build","narrate"].indexOf(phase) > i || phase === "done") ? "#0F6E56" : "#9ca3af",
              }}>
                {p}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}`,
      },
    },
    {
      type: "code",
      id: "da-memory-code",
      language: "python",
      filename: "apps/agent/src/bounded_memory_saver.py",
      content: `class BoundedMemorySaver(MemorySaver):
    """MemorySaver that evicts oldest threads when exceeding max_threads."""

    def __init__(self, max_threads: int = 200):
        super().__init__()
        self.max_threads = max_threads
        self._insertion_order: OrderedDict[str, None] = OrderedDict()

    def put(self, config, checkpoint, metadata, new_versions):
        thread_id = config["configurable"]["thread_id"]
        self._insertion_order[thread_id] = None
        self._insertion_order.move_to_end(thread_id)

        result = super().put(config, checkpoint, metadata, new_versions)

        while len(self.storage) > self.max_threads:
            oldest, _ = self._insertion_order.popitem(last=False)
            if oldest in self.storage:
                del self.storage[oldest]
        return result`,
    },
  ],
};
