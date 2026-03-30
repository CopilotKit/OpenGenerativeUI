# Deployment

## Render (Frontend Only)

The project includes a `render.yaml` that deploys the **frontend** to [Render](https://render.com/).
The agent is deployed separately — see [LangGraph Platform](#langgraph-platform-langsmith-cloud) below.

### Frontend Service (Node)

- Runtime: Node 22
- Build: `corepack enable && pnpm install --no-frozen-lockfile && pnpm --filter @repo/app build`
- Start: `pnpm --filter @repo/app start`
- Health check: `GET /api/health`

### Environment Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `LANGGRAPH_DEPLOYMENT_URL` | Yes | URL of your LangGraph agent (e.g., `https://<id>.default.us.langgraph.app`) |
| `LANGSMITH_API_KEY` | Yes* | Required when agent is on LangGraph Platform (sent as `x-api-key`) |
| `RATE_LIMIT_ENABLED` | No | Set to `true` to enable per-IP rate limiting |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window in ms (default: 60000) |
| `RATE_LIMIT_MAX` | No | Max requests per window (default: 40) |
| `SKIP_INSTALL_DEPS` | No | Set to `true` to skip redundant installs |

\*Not required if the agent is self-hosted on a private network without auth.

### Deploy

1. Fork the repository
2. Create a new **Blueprint** on Render
3. Connect your forked repo
4. In the Render dashboard, set `LANGGRAPH_DEPLOYMENT_URL` to your agent's URL
5. Set `LANGSMITH_API_KEY` to your LangSmith API key
6. Deploy

Render reads `render.yaml` and creates the frontend service.

## LangGraph Platform (LangSmith Cloud)

The agent can be deployed as a managed service on [LangGraph Platform](https://docs.langchain.com/langsmith/cli#deploy) using the `langgraph deploy` CLI. The platform provides built-in Postgres persistence, tracing, streaming, and auto-scaling.

### Prerequisites

- A [LangSmith](https://smith.langchain.com) account (Plus plan or higher)
- LangSmith API key (`LANGSMITH_API_KEY`)
- The `langgraph` CLI: `pip install langgraph-cli`
- Docker installed and running (Apple Silicon users need Docker Buildx)

### Deploy

```bash
cd apps/agent
langgraph deploy --name open-generative-ui-agent
```

The CLI reads `langgraph.json`, builds a Docker image, and pushes it to the managed registry. Auth is via `LANGSMITH_API_KEY` env var or `--api-key` flag.

After deployment, configure environment variables in the [LangSmith dashboard](https://smith.langchain.com):

| Variable | Required | Notes |
|----------|----------|-------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `LANGGRAPH_CLOUD` | Yes | Set to `true` — skips local checkpointer in favor of platform-managed Postgres |
| `LLM_MODEL` | No | Defaults to `gpt-5.4-2026-03-05` |
| `LANGCHAIN_TRACING_V2` | No | Set to `true` for built-in tracing |
| `LANGCHAIN_PROJECT` | No | Project name for organizing traces |

Note the deployment URL (e.g., `https://<id>.default.us.langgraph.app`).

### Other CLI Commands

| Command | Description |
|---------|-------------|
| `langgraph deploy list` | List all deployments |
| `langgraph deploy logs` | Fetch runtime or build logs |
| `langgraph deploy revisions list <id>` | Show revision history |
| `langgraph dev` | Local dev server (no Docker) |

## Split Deployment: Render + LangGraph Platform

The recommended production setup runs the frontend on Render and the agent on LangGraph Platform. This gives you managed scaling and Postgres persistence for the agent, with familiar Node hosting for the frontend.

### Architecture

```
┌──────────────────────┐       HTTPS + x-api-key       ┌─────────────────────────┐
│  Render (Frontend)   │  ──────────────────────────▶  │  LangGraph Platform     │
│  Next.js on Node 22  │                               │  (LangSmith Cloud)      │
│  /api/copilotkit     │  ◀──────────────────────────  │  Python agent           │
└──────────────────────┘       SSE / streaming          └─────────────────────────┘
```

### Step-by-Step

1. **Deploy the agent** on LangGraph Platform:
   ```bash
   cd apps/agent
   langgraph deploy --name open-generative-ui-agent
   ```
   Then set `OPENAI_API_KEY` and `LANGGRAPH_CLOUD=true` in the LangSmith dashboard.
   Note the deployment URL.

2. **Deploy the frontend** on Render following the [Render](#render-frontend-only) section.
   In the Render dashboard, set:
   - `LANGGRAPH_DEPLOYMENT_URL` = your LangGraph Platform URL (e.g., `https://<id>.default.us.langgraph.app`)
   - `LANGSMITH_API_KEY` = your LangSmith API key (starts with `lsv2_`)

3. **Verify** by hitting `GET /api/health` on the frontend and sending a test message through the UI.

### How Auth Works

The frontend's API route (`/api/copilotkit`) reads `LANGSMITH_API_KEY` from the environment and sends it as an `x-api-key` header on every request to the agent. LangGraph Platform validates this key. The API key is never exposed to the browser — it stays server-side in the Next.js API route.

### Self-Hosted vs. LangGraph Platform

| Concern | Self-Hosted | LangGraph Platform |
|---------|-------------|--------------------|
| Checkpointer | BoundedMemorySaver (in-memory) | Managed Postgres (automatic) |
| HTTP serving | FastAPI + uvicorn | Platform-managed |
| Health checks | `/health` endpoint | Platform-managed |
| Tracing | Optional (LANGSMITH_API_KEY) | Built-in |
| Scaling | Manual / render.yaml | Platform-managed |
| Auth | None (private network) | LANGSMITH_API_KEY required |

## General Deployment

For other platforms, you need to deploy two services:

### 1. Agent (Python)

```bash
cd apps/agent
pip install uv
uv sync
uv run uvicorn main:app --host 0.0.0.0 --port 8123
```

Requirements:
- Python 3.12+
- `OPENAI_API_KEY` environment variable
- Port exposed for the frontend to reach

### 2. Frontend (Node)

```bash
# From repo root
corepack enable
pnpm install
pnpm --filter @repo/app build
LANGGRAPH_DEPLOYMENT_URL=http://your-agent-host:8123 pnpm --filter @repo/app start
```

Requirements:
- Node 22+
- `LANGGRAPH_DEPLOYMENT_URL` pointing to the agent service
- Port 3000 exposed

### Health Checks

| Service | Endpoint | Expected |
|---------|----------|----------|
| Agent | `GET /health` | `{"status": "ok"}` |
| Frontend | `GET /api/health` | 200 OK |

## Docker

A Dockerfile for the frontend is available at `docker/Dockerfile.app`. The agent can be containerized with a standard Python Dockerfile using `uv`.

## Next Steps

- [Getting Started](getting-started.md) — Local development setup
- [Architecture](architecture.md) — Understand the service topology
