import type { Chapter } from "@/lib/types";

export const introduction: Chapter = {
  id: "introduction",
  title: "Introduction",
  description: "What is OpenGenerativeUI and how does it work?",
  icon: "🪁",
  cells: [
    {
      type: "markdown",
      id: "intro-what",
      content: `# Welcome to OpenGenerativeUI

OpenGenerativeUI is an open-source template that demonstrates **AI agent-driven UI** using [CopilotKit](https://copilotkit.ai) and [LangGraph](https://langchain-ai.github.io/langgraph/).

Unlike traditional chatbots that only produce text, this project shows how an AI agent can **directly manipulate application state** — adding todos, generating charts, rendering interactive widgets — all while the user can interact with the same UI.

## What makes this different?

- **Agent-driven UI**: The AI doesn't just talk — it builds and modifies real UI components
- **Bidirectional state sync**: Both the user and the agent can modify the same state
- **Generative UI**: The agent produces rich, interactive components (charts, widgets, 3D visualizations) on the fly
- **Human-in-the-loop**: The agent can pause and ask for user input when needed`,
    },
    {
      type: "markdown",
      id: "intro-architecture",
      content: `## Architecture

The project is a **Turborepo monorepo** with three main pieces:

| Component | Tech | Purpose |
|-----------|------|---------|
| \`apps/app\` | Next.js 16, React 19 | Frontend with CopilotKit integration |
| \`apps/agent\` | LangGraph, Python | AI agent with tools and state |
| \`apps/mcp\` | MCP Server | Design system for external AI tools |

The frontend communicates with the agent through CopilotKit's runtime, which bridges React hooks to the LangGraph agent backend.`,
    },
    {
      type: "code",
      id: "intro-monorepo",
      language: "bash",
      filename: "Project Structure",
      content: `apps/
├── app/          # Next.js frontend (React 19, TailwindCSS 4)
│   └── src/
│       ├── app/           # Pages & API routes
│       ├── components/    # UI components
│       └── hooks/         # CopilotKit hook registrations
├── agent/        # LangGraph Python agent
│   ├── main.py            # Agent entry point
│   └── src/
│       ├── todos.py       # Todo tools & state schema
│       └── query.py       # Data query tool
└── mcp/          # MCP design system server
    └── skills/            # Agent skill documents`,
    },
    {
      type: "markdown",
      id: "intro-flow",
      content: `## How it flows

1. User opens the app and sees a chat interface alongside a todo canvas
2. User types a message (e.g., "Add 3 todos for a weekend trip")
3. CopilotKit sends the message to the LangGraph agent
4. The agent calls the \`manage_todos\` tool to update state
5. State syncs back to the frontend via CopilotKit
6. The todo list UI updates reactively

Let's dive into how each piece works, starting with **Agent State**.`,
    },
  ],
};
