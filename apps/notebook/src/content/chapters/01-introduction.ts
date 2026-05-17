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

Three systems work together in a layered architecture:`,
    },
    {
      type: "mermaid",
      id: "intro-arch-diagram",
      title: "System Architecture",
      content: `graph TD
    User([User]) -->|chat message| CK[CopilotKit\nReact hooks + runtime]
    CK -->|forwards to agent| DA[Deep Agent\nLangGraph + tools + skills]
    DA -->|tool calls| Tools{Tools}
    Tools -->|plan_visualization| DA
    Tools -->|widgetRenderer| WR[Widget Renderer\nSandboxed iframe + Idiomorph]
    Tools -->|pieChart / barChart| WR
    WR -->|renders in browser| User

    style CK fill:#EDE9F5,stroke:#5B3FA0,color:#3E2B6F
    style DA fill:#E3EFFC,stroke:#2663B3,color:#1A4680
    style WR fill:#E1F5EE,stroke:#0F6E56,color:#085041
    style User fill:#f7f6f3,stroke:#9c9a92,color:#1a1a1a
    style Tools fill:#FAEEDA,stroke:#B8860B,color:#854F0B`,
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
