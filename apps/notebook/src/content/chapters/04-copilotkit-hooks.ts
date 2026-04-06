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

The agent backend uses \`create_deep_agent\` from the \`deepagents\` library — a LangGraph-based agent factory that supports tools, middleware, skills, and bounded memory.

The agent is configured in a single file (\`main.py\`) with:
- A language model (GPT-5.4)
- A set of tools (todos, planning, data query, form generation)
- CopilotKit middleware (bridges agent state to the frontend)
- A skills directory (loaded at runtime for contextual instructions)
- A system prompt defining the visualization workflow
- A bounded memory saver (prevents OOM on constrained hosts)`,
    },
    {
      type: "code",
      id: "da-main",
      language: "python",
      filename: "apps/agent/main.py",
      content: `from deepagents import create_deep_agent
from copilotkit import CopilotKitMiddleware, LangGraphAGUIAgent
from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from langchain_openai import ChatOpenAI

agent = create_deep_agent(
    model=ChatOpenAI(model=os.environ.get("LLM_MODEL", "gpt-5.4-2026-03-05")),
    tools=[query_data, plan_visualization, *todo_tools, generate_form],
    middleware=[CopilotKitMiddleware()],
    context_schema=AgentState,
    skills=[str(Path(__file__).parent / "skills")],
    checkpointer=BoundedMemorySaver(max_threads=200),
    system_prompt="...",  # See below
)

# FastAPI endpoint — CopilotKit runtime connects here
app = FastAPI()
add_langgraph_fastapi_endpoint(
    app=app,
    agent=LangGraphAGUIAgent(
        name="sample_agent",
        description="CopilotKit + LangGraph demo agent",
        graph=agent,
    ),
    path="/",
)`,
    },
    {
      type: "markdown",
      id: "da-state",
      content: `## Agent State Schema

State is defined as a Python TypedDict. CopilotKit syncs this bidirectionally with the frontend via \`useAgent()\`:`,
    },
    {
      type: "code",
      id: "da-state-code",
      language: "python",
      filename: "apps/agent/src/todos.py",
      content: `from langchain.agents import AgentState as BaseAgentState
from typing import TypedDict, Literal

class Todo(TypedDict):
    id: str
    title: str
    description: str
    emoji: str
    status: Literal["pending", "completed"]

class AgentState(BaseAgentState):
    todos: list[Todo]`,
    },
    {
      type: "markdown",
      id: "da-tools",
      content: `## Tools

The agent has 5 tools, each serving a specific role:

| Tool | Purpose | Returns |
|------|---------|---------|
| \`manage_todos\` | Add/update/remove todos | \`Command(update={todos: [...]})\` — updates state |
| \`get_todos\` | Read current todos | Current state.todos |
| \`plan_visualization\` | **Mandatory** before any visual | Plan summary string |
| \`query_data\` | Fetch CSV data for charts | Cached row dictionaries |
| \`generate_form\` | Produce login/contact forms | Surface update events |

The \`manage_todos\` tool is the most important — it uses LangGraph's \`Command\` to atomically update state:`,
    },
    {
      type: "code",
      id: "da-manage-todos",
      language: "python",
      filename: "apps/agent/src/todos.py — manage_todos",
      content: `@tool
def manage_todos(todos: list[Todo], runtime: ToolRuntime) -> Command:
    """Manage the current todos."""
    # Ensure all todos have unique IDs
    for todo in todos:
        if "id" not in todo or not todo["id"]:
            todo["id"] = str(uuid.uuid4())

    # Atomic state update via LangGraph Command
    return Command(update={
        "todos": todos,
        "messages": [
            ToolMessage(
                content="Successfully updated todos",
                tool_call_id=runtime.tool_call_id
            )
        ]
    })`,
    },
    {
      type: "code",
      id: "da-plan",
      language: "python",
      filename: "apps/agent/src/plan.py — plan_visualization",
      content: `@tool
def plan_visualization(
    approach: str, technology: str, key_elements: list[str]
) -> str:
    """Plan a visualization before building it. MUST be called before
    widgetRenderer, pieChart, or barChart.

    Args:
        approach: One sentence describing the visualization strategy.
        technology: The primary technology (e.g. "Three.js", "D3.js",
            "inline SVG", "Chart.js").
        key_elements: 2-4 concise bullet points of what will be built.
    """
    elements = "\\n".join(f"  - {e}" for e in key_elements)
    return f"Plan: {approach}\\nTech: {technology}\\n{elements}"`,
    },
    {
      type: "markdown",
      id: "da-system-prompt",
      content: `## System Prompt

The system prompt encodes the **mandatory visualization workflow** and quality standards:

1. **Acknowledge** → **Plan** → **Build** → **Narrate** (never skip plan)
2. \`<script type="module">\` is REQUIRED for import map usage
3. 3D content MUST use Three.js with WebGL, PBR materials, multiple lights, OrbitControls
4. Every visualization should be "polished and portfolio-ready"
5. Always call \`query_data\` before showing charts
6. Be brief about CopilotKit/LangGraph explanations (1-2 sentences)`,
    },
    {
      type: "markdown",
      id: "da-memory",
      content: `## Bounded Memory

The default LangGraph \`MemorySaver\` stores all conversation threads in memory forever — a problem on memory-constrained hosts (512MB). \`BoundedMemorySaver\` adds FIFO eviction:`,
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
        self._insertion_order.move_to_end(thread_id)  # LRU tracking

        result = super().put(config, checkpoint, metadata, new_versions)

        # Evict oldest threads when over limit
        while len(self.storage) > self.max_threads:
            oldest, _ = self._insertion_order.popitem(last=False)
            if oldest in self.storage:
                del self.storage[oldest]
        return result`,
    },
    {
      type: "playground",
      id: "da-playground",
      title: "Try it: Agent Tool Pipeline",
      files: {
        "/App.js": `import { useState } from "react";

// Simulate the mandatory visualization workflow:
// Acknowledge → Plan → Build → Narrate

const steps = [
  {
    type: "acknowledge",
    content: "I'll create a visualization showing the agent architecture.",
  },
  {
    type: "tool_call",
    tool: "plan_visualization",
    args: {
      approach: "Layered diagram showing data flow from user to agent to frontend",
      technology: "inline SVG",
      keyElements: [
        "User input → CopilotKit runtime",
        "LangGraph agent processes with tools",
        "State syncs back to React frontend",
        "Widget renderer displays result",
      ],
    },
  },
  {
    type: "tool_call",
    tool: "widgetRenderer",
    args: { title: "Architecture Flow", description: "Agent data flow" },
  },
  {
    type: "narrate",
    content: "The diagram shows how a user message flows through CopilotKit to the LangGraph agent, which calls tools to update state, and the result syncs back to the frontend for rendering.",
  },
];

export default function App() {
  const [current, setCurrent] = useState(-1);
  const [running, setRunning] = useState(false);

  const runPipeline = async () => {
    setRunning(true);
    setCurrent(-1);
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 1000));
      setCurrent(i);
    }
    setRunning(false);
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 20 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
        Mandatory Visualization Workflow
      </h2>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
        Every visual response follows: Acknowledge → Plan → Build → Narrate
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {steps.map((step, i) => {
          const active = i <= current;
          const isCurrent = i === current;
          return (
            <div
              key={i}
              style={{
                padding: 12, borderRadius: 8, fontSize: 13,
                background: active ? (step.type === "tool_call" ? "#f5f3ff" : "#f9fafb") : "#fafafa",
                border: \`1px solid \${isCurrent ? "#9599CC" : active ? "#e5e7eb" : "#f0f0f0"}\`,
                opacity: active ? 1 : 0.4,
                transition: "all 0.3s ease",
              }}
            >
              <div style={{
                fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                color: step.type === "tool_call" ? "#9599CC" : "#6b7280",
                marginBottom: 4,
              }}>
                {step.type === "tool_call" ? \`🔧 \${step.tool}\` :
                 step.type === "acknowledge" ? "💬 Acknowledge" :
                 "📝 Narrate"}
              </div>
              {step.type === "tool_call" ? (
                <pre style={{
                  margin: 0, fontSize: 11, fontFamily: "monospace",
                  color: "#374151", whiteSpace: "pre-wrap",
                }}>
                  {JSON.stringify(step.args, null, 2)}
                </pre>
              ) : (
                <div style={{ color: "#374151" }}>{step.content}</div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={runPipeline}
        disabled={running}
        style={{
          padding: "8px 16px", borderRadius: 8, border: "none",
          background: running ? "#d1d5db" : "#9599CC", color: "#fff",
          cursor: running ? "default" : "pointer", fontWeight: 600, fontSize: 13,
        }}
      >
        {running ? "Running pipeline..." : "Run Visualization Pipeline"}
      </button>
    </div>
  );
}`,
      },
    },
  ],
};
