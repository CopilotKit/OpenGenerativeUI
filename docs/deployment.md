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
| `ANTHROPIC_API_KEY` | Agent | Yes | Your Anthropic API key |
| `LLM_MODEL` | Agent | No | Defaults to `claude-fable-5` |
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
4. Add `ANTHROPIC_API_KEY` as a secret
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
- `ANTHROPIC_API_KEY` environment variable
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
