# Open Generative UI

An open-source showcase for building rich, interactive AI-generated UI with [CopilotKit](https://copilotkit.ai) and [LangGraph](https://langchain-ai.github.io/langgraph/). Ask the agent to visualize algorithms, create 3D animations, render charts, or generate interactive diagrams — all rendered as live HTML/SVG inside a sandboxed iframe.

https://github.com/user-attachments/assets/ed28c734-e54e-4412-873f-4801da544a7f

## What It Does

The agent produces **generative UI** — not just text responses, but fully interactive visual components:

- **Algorithm visualizations** — binary search, BFS vs DFS, sorting algorithms
- **3D animations** — interactive WebGL/CSS3D scenes
- **Charts & diagrams** — pie charts, bar charts, network diagrams
- **Interactive widgets** — forms, simulations, math plots

All visuals are rendered in sandboxed iframes with automatic light/dark theming, progressive reveal animations, and responsive sizing.

## Quick Start

```bash
make setup    # Install deps + create .env template
# Edit apps/agent/.env with your real OpenAI API key
make dev      # Start all services
```

> **Strong models required.** Generative UI demands high-capability models that can produce complex, well-structured HTML/SVG in a single pass. Set `LLM_MODEL` in your `.env` to one of:
>
> | Model | Provider |
> |-------|----------|
> | `gpt-5.4` / `gpt-5.4-pro` | OpenAI |
> | `claude-opus-4-6` | Anthropic |
> | `gemini-3.1-pro` | Google |
> | `MiniMax-M2.7` / `MiniMax-M2.7-highspeed` | [MiniMax](https://www.minimaxi.com) |
>
> Smaller or weaker models will produce broken layouts, missing interactivity, or incomplete visualizations.
>
> **Using MiniMax:** Set `MINIMAX_API_KEY` in your `.env` — the provider is auto-detected. Defaults to `MiniMax-M2.7` (1M context window). See [MiniMax docs](https://www.minimaxi.com/document/introduction) for API keys.

- **App**: http://localhost:3000
- **Agent**: http://localhost:8123

### Available Commands

| Command | Description |
|---------|-------------|
| `make setup` | Install all dependencies and create `.env` template |
| `make dev` | Start all services (frontend + agent + mcp) |
| `make dev-app` | Start Next.js frontend only |
| `make dev-agent` | Start LangGraph agent only |
| `make dev-mcp` | Start MCP server only |
| `make build` | Build all apps |
| `make lint` | Lint all apps |
| `make clean` | Clean build artifacts |
| `make help` | Show all available commands |

You can also use `pnpm` directly (`pnpm dev`, `pnpm dev:app`, `pnpm dev:agent`, etc.).

## MCP Server (Self-Hosted)

The repo includes a standalone [Model Context Protocol](https://modelcontextprotocol.io) server that exposes the design system, skill instructions, and an HTML document assembler to any MCP-compatible client — including Claude Desktop, Claude Code, and Cursor.

### What it provides

- **`assemble_document` tool** — wraps HTML fragments with the full design system CSS and bridge JS, returning an iframe-ready document
- **Skill resources** — browse and read skill instruction documents (`skills://list`, `skills://{name}`)
- **Prompt templates** — pre-composed prompts for widgets, SVG diagrams, and advanced visualizations

### Claude Desktop (stdio)

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "open-generative-ui": {
      "command": "node",
      "args": ["dist/stdio.js"],
      "cwd": "/path/to/apps/mcp"
    }
  }
}
```

### Claude Code / HTTP clients

```bash
# Start the HTTP server
cd apps/mcp && pnpm dev
```

Add to `.mcp.json`:

```json
{
  "openGenerativeUI": {
    "url": "http://localhost:3100/mcp"
  }
}
```

See [apps/mcp/README.md](apps/mcp/README.md) for full configuration, Docker deployment, and API reference.

## Architecture

Turborepo monorepo with three packages:

```
apps/
├── app/       Next.js 16 frontend (CopilotKit v2, React 19, Tailwind 4)
├── agent/     LangGraph Python agent (GPT-5.4, CopilotKit middleware)
└── mcp/       Standalone MCP server (design system + skills + document assembler)
```

### How It Works

1. **User sends a prompt** via the CopilotKit chat UI
2. **Agent decides** whether to respond with text, call a tool, or render a visual component
3. **`widgetRenderer`** — a frontend `useComponent` hook — receives the agent's HTML and renders it in a sandboxed iframe
4. **Skeleton loading** shows while the iframe loads, then content fades in smoothly
5. **ResizeObserver** inside the iframe reports content height back to the parent for seamless auto-sizing

### Key CopilotKit Patterns

| Pattern | Hook | Example |
|---------|------|---------|
| Generative UI | `useComponent` | Pie charts, bar charts, widget renderer |
| Frontend tools | `useFrontendTool` | Theme toggle |
| Human-in-the-loop | `useHumanInTheLoop` | Meeting scheduler |
| Default tool render | `useDefaultRenderTool` | Tool execution status |

## Decision Matrix — Picking the Right Visual

| User asks about...          | Output type              | Technology          |
|-----------------------------|--------------------------|---------------------|
| How X works (physical)      | Illustrative diagram     | SVG                 |
| How X works (abstract)      | Interactive explainer    | HTML + inline SVG   |
| Process / steps             | Flowchart                | SVG                 |
| Architecture / containment  | Structural diagram       | SVG                 |
| Database schema / ERD       | Relationship diagram     | Mermaid             |
| Trends over time            | Line chart               | Chart.js            |
| Category comparison         | Bar chart                | Chart.js            |
| Part of whole               | Doughnut chart           | Chart.js            |
| KPIs / metrics              | Dashboard                | HTML metric cards   |
| Design a UI                 | Mockup                   | HTML                |
| Choose between options      | Comparison cards         | HTML grid           |
| Cyclic process              | Step-through             | HTML stepper        |
| Physics / math              | Simulation               | Canvas + JS         |
| Function / equation         | Plotter                  | SVG + JS            |
| Data exploration            | Sortable table           | HTML + JS           |
| Creative / decorative       | Art / illustration       | SVG                 |
| 3D visualization            | 3D scene                 | Three.js            |
| Music / audio               | Synthesizer              | Tone.js             |
| Network / graph             | Force layout             | D3.js               |
| Quick factual answer        | Plain text               | None                |
| Code solution               | Code block               | None                |
| Emotional support           | Warm text                | None                |

## Tech Stack

Next.js 16, React 19, Tailwind CSS 4, LangGraph, CopilotKit v2, Turborepo, Recharts

## License

MIT
