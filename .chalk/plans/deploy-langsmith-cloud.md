# Deployment Migration — LangSmith Cloud (LangGraph Platform)

## Context

Migrating from a fully self-hosted Render deployment (both agent + frontend) to a split topology: **frontend on Render, agent on LangGraph Platform (LangSmith Cloud)**. The codebase changes are on `feat/deploy-langsmith-cloud` (commit `0d3a6e6`). This plan covers the safe rollout path: branch deploy to dev, verify, merge to main, promote to production.

### What changed (code)

- `render.yaml` — Agent service removed; `LANGGRAPH_DEPLOYMENT_URL` switched from `fromService` to `sync: false`
- `apps/agent/main.py` — `LANGGRAPH_CLOUD` detection fixed (truthy string bug), startup log added
- `apps/agent/langgraph.json` — Already correct: `"sample_agent": "./main.py:agent"`, no `.env` ref
- `docs/deployment.md` — Rewritten for split deployment with `langgraph deploy` CLI
- `.env.example` — Noted `LANGSMITH_API_KEY` needed on frontend

### Prerequisites

- [ ] LangSmith account (Plus plan or higher)
- [ ] LangSmith API key (`lsv2_...`) — obtain from https://smith.langchain.com/settings
- [ ] `langgraph` CLI installed: `pip install langgraph-cli`
- [ ] Docker installed and running (Apple Silicon: ensure Buildx is available)
- [ ] `OPENAI_API_KEY` ready for agent env vars
- [ ] Render dashboard access for the frontend service

---

## Phase 1: Deploy Branch to Development (LangSmith Cloud)

### 1.1 Create development deployment on LangGraph Platform

```bash
cd apps/agent
langgraph deploy \
  --name open-generative-ui-agent-dev \
  --deployment-type dev
```

- The CLI builds a Docker image from `langgraph.json` and pushes to the managed registry
- Use `--verbose` if the build fails to see Docker output
- Apple Silicon: the CLI uses Buildx to cross-compile to `linux/amd64`

### 1.2 Configure agent env vars in LangSmith dashboard

Navigate to the deployment in the LangSmith dashboard and set:

| Variable | Value |
|----------|-------|
| `OPENAI_API_KEY` | Your OpenAI key |
| `LANGGRAPH_CLOUD` | `true` |
| `LLM_MODEL` | `gpt-5.4-2026-03-05` (or preferred model) |
| `LANGCHAIN_TRACING_V2` | `true` |
| `LANGCHAIN_PROJECT` | `open-generative-ui-dev` |

### 1.3 Note the deployment URL

After the deployment is live, note the URL:
```
https://<id>.default.us.langgraph.app
```

### 1.4 Point local frontend at dev deployment

Test locally before touching Render:

```bash
LANGGRAPH_DEPLOYMENT_URL=https://<id>.default.us.langgraph.app \
LANGSMITH_API_KEY=lsv2_... \
pnpm dev:app
```

---

## Phase 2: Verify Development Deployment

### 2.1 Smoke tests

- [ ] Frontend loads at `http://localhost:3000`
- [ ] Chat input accepts a message and gets a response
- [ ] Agent can add/update/complete todos (state sync works)
- [ ] Generative UI renders (widgetRenderer, charts)
- [ ] No checkpointer warnings in agent logs (check via `langgraph deploy logs`)

### 2.2 Persistence check

- [ ] Send a message, note the thread ID
- [ ] Refresh the page — conversation state should persist (Postgres-backed)
- [ ] This is the key improvement over BoundedMemorySaver (in-memory, lost on restart)

### 2.3 Tracing check

- [ ] Open LangSmith dashboard → project `open-generative-ui-dev`
- [ ] Verify traces appear for each agent invocation
- [ ] Check for errors or unexpected latency in traces

### 2.4 Auth check

- [ ] Confirm requests without `x-api-key` header are rejected by the platform
- [ ] Confirm requests with valid `LANGSMITH_API_KEY` succeed

### 2.5 Edge cases

- [ ] Rapid successive messages (rate limiting on frontend if enabled)
- [ ] Long-running agent response (streaming works end-to-end)
- [ ] Empty/malformed input handling

---

## Phase 3: Deploy Frontend Branch to Render (Optional)

If you want to test the full split deployment before merging:

### 3.1 Push branch and create preview

Render supports branch-based preview environments. Push the branch:

```bash
git push origin feat/deploy-langsmith-cloud
```

In Render dashboard, create a preview environment or manually set env vars on a staging service:

| Variable | Value |
|----------|-------|
| `LANGGRAPH_DEPLOYMENT_URL` | `https://<id>.default.us.langgraph.app` (dev deployment) |
| `LANGSMITH_API_KEY` | `lsv2_...` |

### 3.2 Verify on Render

- [ ] Frontend health check passes: `GET /api/health` → 200
- [ ] Chat works end-to-end through Render → LangGraph Platform
- [ ] No CORS or network errors in browser console

---

## Phase 4: Merge to Main

### 4.1 PR and merge

```bash
gh pr create \
  --title "feat: split deployment — frontend on Render, agent on LangGraph Platform" \
  --base main \
  --head feat/deploy-langsmith-cloud
```

After review/approval:
```bash
gh pr merge --squash
```

### 4.2 Verify CI passes

- [ ] CI smoke tests pass (build + lint + startup check)
- [ ] No regressions on the frontend build

---

## Phase 5: Deploy Main to Production (LangSmith Cloud)

### 5.1 Create production deployment

```bash
cd apps/agent
langgraph deploy \
  --name open-generative-ui-agent \
  --deployment-type prod
```

Or update existing deployment:
```bash
langgraph deploy \
  --name open-generative-ui-agent \
  --deployment-id <existing-deployment-id>
```

### 5.2 Configure production env vars in LangSmith dashboard

| Variable | Value |
|----------|-------|
| `OPENAI_API_KEY` | Production OpenAI key |
| `LANGGRAPH_CLOUD` | `true` |
| `LLM_MODEL` | `gpt-5.4-2026-03-05` |
| `LANGCHAIN_TRACING_V2` | `true` |
| `LANGCHAIN_PROJECT` | `open-generative-ui` |

### 5.3 Note production deployment URL

```
https://<prod-id>.default.us.langgraph.app
```

### 5.4 Update Render production frontend

In the Render dashboard, update the production frontend env vars:

| Variable | Value |
|----------|-------|
| `LANGGRAPH_DEPLOYMENT_URL` | `https://<prod-id>.default.us.langgraph.app` |
| `LANGSMITH_API_KEY` | Production LangSmith API key |

Trigger a redeploy (or it will auto-deploy from the main branch merge).

### 5.5 Production verification

- [ ] `GET /api/health` → 200
- [ ] Chat works end-to-end
- [ ] Todos persist across page refreshes
- [ ] Traces appear in LangSmith project `open-generative-ui`
- [ ] No errors in `langgraph deploy logs`
- [ ] Generative UI (widgets, charts) renders correctly

---

## Rollback

### If agent deployment fails

The previous Render agent service is still defined in the `main` branch prior to merge. If the LangGraph Platform deployment is broken:

1. Revert the `render.yaml` change (restore agent service block)
2. Revert `LANGGRAPH_DEPLOYMENT_URL` to `fromService` in Render dashboard
3. Redeploy on Render

### If frontend deployment fails

The frontend changes are minimal (no code changes to `route.ts`). Rolling back just means pointing `LANGGRAPH_DEPLOYMENT_URL` back to the old agent URL in the Render dashboard.

---

## Post-Migration Cleanup

- [ ] Delete the dev deployment: `langgraph deploy delete <dev-deployment-id>`
- [ ] Remove old Render agent service if it was kept as fallback
- [ ] Confirm LangSmith tracing project is receiving data
- [ ] Update any team runbooks or onboarding docs referencing the old Render agent
- [ ] Consider enabling `RATE_LIMIT_ENABLED=true` on the Render frontend
