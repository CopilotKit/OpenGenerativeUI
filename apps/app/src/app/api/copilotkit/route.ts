import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { LangGraphHttpAgent } from "@copilotkit/runtime/langgraph";
import { NextRequest } from "next/server";

// Simple in-memory sliding-window rate limiter (per IP)
// Enable via RATE_LIMIT_ENABLED=true — off by default.
// For high-traffic deployments, consider Redis-backed rate limiting instead.
const RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED === "true";
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 40;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  if (!RATE_LIMIT_ENABLED) return false;
  const now = Date.now();
  const timestamps = hits.get(ip)?.filter(t => t > now - RATE_LIMIT_WINDOW_MS) ?? [];
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

// Prune stale entries every 5 min to prevent unbounded memory growth
if (RATE_LIMIT_ENABLED) {
  setInterval(() => {
    const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
    hits.forEach((timestamps, ip) => {
      const recent = timestamps.filter(t => t > cutoff);
      if (recent.length === 0) hits.delete(ip);
      else hits.set(ip, recent);
    });
  }, 300_000);
}

// Normalize Render's fromService hostport (bare host:port) into a full URL
const raw = process.env.LANGGRAPH_DEPLOYMENT_URL;
const deploymentUrl = !raw
  ? "http://localhost:8123"
  : raw.startsWith("http")
    ? raw
    : `http://${raw}`;

// 1. Define the agent connection to LangGraph
const defaultAgent = new LangGraphHttpAgent({
  url: deploymentUrl,
  ...(process.env.LANGSMITH_API_KEY && {
    headers: { "x-api-key": process.env.LANGSMITH_API_KEY },
  }),
});

// 3. Define the route and CopilotRuntime for the agent
export const POST = async (req: NextRequest) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return new Response("Too many requests", { status: 429 });
  }

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    endpoint: "/api/copilotkit",
    serviceAdapter: new ExperimentalEmptyAdapter(),
    runtime: new CopilotRuntime({
      agents: { default: defaultAgent, },
      a2ui: { injectA2UITool: true },
      ...(process.env.MCP_SERVER_URL && {
        mcpApps: {
          servers: [{
            type: "http",
            url: process.env.MCP_SERVER_URL,
            serverId: "example_mcp_app",
          }],
        },
      }),
    }),
  });

  return handleRequest(req);
};
