import type { Chapter } from "@/lib/types";

export const introduction: Chapter = {
  id: "introduction",
  title: "Introduction",
  description: "What OpenGenerativeUI is and how the pieces connect.",
  icon: "🪁",
  cells: [
    {
      type: "markdown",
      id: "intro-what",
      content: `# OpenGenerativeUI

OpenGenerativeUI is an open-source template showing how an AI agent can **generate rich, interactive UI** — not just text — using [CopilotKit](https://copilotkit.ai) and [LangGraph](https://langchain-ai.github.io/langgraph/).

The agent produces charts, 3D scenes, SVG diagrams, and interactive widgets that render directly in the chat stream. Users and the agent share the same application state.`,
    },
    {
      type: "markdown",
      id: "intro-arch",
      content: `## Architecture

Three systems work together:

| Layer | Tech | Role |
|-------|------|------|
| **Widget Renderer** | Sandboxed iframe, Idiomorph | Renders agent-generated HTML/SVG/3D in the browser |
| **CopilotKit** | React hooks, runtime API | Bridges the React frontend to the agent backend |
| **Deep Agent** | LangGraph, \`create_deep_agent\` | Orchestrates tools, manages state, follows a mandatory visualization workflow |`,
    },
    {
      type: "code",
      id: "intro-structure",
      language: "bash",
      filename: "Project Structure",
      content: `apps/
├── app/                    # Next.js frontend
│   └── src/
│       ├── components/
│       │   └── generative-ui/
│       │       └── widget-renderer.tsx   # The iframe rendering engine
│       ├── hooks/
│       │   └── use-generative-ui-examples.tsx  # CopilotKit hook registrations
│       └── app/
│           └── api/copilotkit/route.ts   # CopilotKit runtime (connects to agent)
└── agent/                  # LangGraph Python agent
    ├── main.py             # create_deep_agent + system prompt
    └── src/
        ├── todos.py        # AgentState schema + todo tools
        ├── plan.py         # Mandatory plan_visualization tool
        ├── query.py        # Data query tool
        └── bounded_memory_saver.py  # FIFO thread eviction`,
    },
    {
      type: "markdown",
      id: "intro-flow",
      content: `## The Visualization Flow

Every visual response follows a **mandatory 4-step workflow**:

1. **Acknowledge** — Agent replies with 1-2 sentences of context
2. **Plan** — Agent calls \`plan_visualization\` (approach, technology, key elements)
3. **Build** — Agent calls \`widgetRenderer\` / \`pieChart\` / \`barChart\`
4. **Narrate** — Agent adds 2-3 sentences walking through the result

The plan step is never skipped — it gives the user a preview of what's coming and helps the agent organize its approach.

Let's dive into each layer, starting with the **Widget Renderer**.`,
    },
  ],
};
