# Deployment

## Render

The project includes a `render.yaml` for one-click deployment to [Render](https://render.com/).

### Services

**Agent** (Python):
- Runtime: Python 3.12.6
- Build: `pip install uv && uv sync`
- Start: `uv run uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health check: `GET /health`
- Root directory: `apps/agent`

**Frontend** (Node):
- Runtime: Node 22
- Build: `corepack enable && pnpm install --no-frozen-lockfile && pnpm --filter @repo/app build`
- Start: `pnpm --filter @repo/app start`
- Health check: `GET /api/health`
- Root directory: (repo root)

### Environment Variables

| Variable | Service | Required | Notes |
|----------|---------|----------|-------|
| `OPENAI_API_KEY` | Agent | Yes | Your OpenAI API key |
| `LLM_MODEL` | Agent | No | Defaults to `gpt-5.4-2026-03-05` |
| `LANGSMITH_API_KEY` | Agent | No | For LangSmith tracing |
| `LANGGRAPH_DEPLOYMENT_URL` | Frontend | Auto | Injected from agent service via `fromService` |
| `SKIP_INSTALL_DEPS` | Frontend | No | Set to `true` to skip redundant installs |

### Auto-Scaling

Both services are configured with:
- Min instances: 1
- Max instances: 3
- Memory target: 80%
- CPU target: 70%

### Deploy

1. Fork the repository
2. Create a new **Blueprint** on Render
3. Connect your forked repo
4. Add `OPENAI_API_KEY` as a secret
5. Deploy

Render reads `render.yaml` and creates both services. The frontend automatically gets the agent URL via service discovery.

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

## LangGraph Platform (LangSmith Cloud)

The agent can be deployed as a managed service on [LangGraph Platform](https://docs.smith.langchain.com/langgraph-platform/deployment) for built-in tracing, streaming, and persistence.

### Prerequisites

- A [LangSmith](https://smith.langchain.com) account (Plus plan or higher)
- LangSmith API key
- The `langgraph` CLI: `pip install langgraph-cli`

### Deploy

1. Connect your GitHub repo to LangSmith via **Deployments > + New Deployment**
2. Set the root directory to `apps/agent`
3. Configure environment variables in the LangSmith dashboard:

| Variable | Required | Notes |
|----------|----------|-------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `LANGGRAPH_CLOUD` | Yes | Set to `true` — enables platform-native checkpointer |
| `LLM_MODEL` | No | Defaults to `gpt-5.4-2026-03-05` |
| `LANGCHAIN_TRACING_V2` | No | Set to `true` for built-in tracing |
| `LANGCHAIN_PROJECT` | No | Project name for organizing traces |

4. Note the deployment URL (e.g., `https://<id>.default.us.langgraph.app`)

### Connect the Frontend

Set `LANGGRAPH_DEPLOYMENT_URL` and `LANGSMITH_API_KEY` on your frontend:

```bash
LANGGRAPH_DEPLOYMENT_URL=https://<id>.default.us.langgraph.app \
LANGSMITH_API_KEY=lsv2_... \
pnpm --filter @repo/app start
```

The frontend automatically sends `x-api-key` headers when `LANGSMITH_API_KEY` is set.

### Self-Hosted vs. LangGraph Platform

| Concern | Self-Hosted (Render) | LangGraph Platform |
|---------|---------------------|--------------------|
| Checkpointer | BoundedMemorySaver (in-memory) | Managed Postgres (automatic) |
| HTTP serving | FastAPI + uvicorn | Platform-managed |
| Health checks | `/health` endpoint | Platform-managed |
| Tracing | Optional (LANGSMITH_API_KEY) | Built-in |
| Scaling | render.yaml config | Platform-managed |
| Auth | None (private network) | LANGSMITH_API_KEY required |

## Docker

A Dockerfile for the frontend is available at `docker/Dockerfile.app`. The agent can be containerized with a standard Python Dockerfile using `uv`.

## Next Steps

- [Getting Started](getting-started.md) — Local development setup
- [Architecture](architecture.md) — Understand the service topology
