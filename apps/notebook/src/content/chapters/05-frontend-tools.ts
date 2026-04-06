import type { Chapter } from "@/lib/types";

export const frontendTools: Chapter = {
  id: "frontend-tools",
  title: "Frontend Tools",
  description:
    "How the agent calls JavaScript functions in the browser.",
  icon: "🛠",
  cells: [
    {
      type: "markdown",
      id: "tools-concept",
      content: `# Frontend Tools

Frontend tools let the agent **execute JavaScript in the browser**. This is different from component tools (which render UI) — frontend tools perform actions like:

- Toggling theme (light/dark mode)
- Navigating to a page
- Triggering animations
- Reading browser state (viewport size, scroll position)
- Modifying DOM elements

The agent sees these tools in its tool list and can call them as needed during a conversation.`,
    },
    {
      type: "code",
      id: "tools-toggle-theme",
      language: "tsx",
      filename: "apps/app/src/hooks/use-generative-ui-examples.tsx — toggleTheme",
      content: `import { useFrontendTool } from "@copilotkit/react-core";
import { z } from "zod";
import { useTheme } from "@/hooks/use-theme";

// Inside the hook setup function:
const { setTheme } = useTheme();

useFrontendTool("toggleTheme", {
  description: "Toggle between light and dark mode",
  schema: z.object({
    theme: z.enum(["light", "dark"]),
  }),
  handler: ({ theme }) => {
    setTheme(theme);
    return \`Theme switched to \${theme}\`;
  },
});`,
    },
    {
      type: "markdown",
      id: "tools-render",
      content: `## Render Tools (useRenderTool)

Sometimes you want a tool that **both executes logic AND renders UI** while it runs. \`useRenderTool()\` shows a component during tool execution — perfect for progress indicators, previews, or step-by-step visualizations:`,
    },
    {
      type: "code",
      id: "tools-render-code",
      language: "tsx",
      filename: "Plan visualization render tool",
      content: `import { useRenderTool } from "@copilotkit/react-core";
import { PlanCard } from "../components/generative-ui/plan-card";

useRenderTool("plan_visualization", {
  description: "Show planning progress to the user",
  schema: z.object({
    status: z.string(),
    approach: z.string(),
    technology: z.string(),
    keyElements: z.array(z.string()),
  }),
  component: PlanCard,
  // Tool can also return data to the agent
  handler: (props) => \`Plan displayed: \${props.approach}\`,
});`,
    },
    {
      type: "playground",
      id: "tools-playground",
      title: "Try it: Frontend Tool Simulation",
      files: {
        "/App.js": `import { useState } from "react";

// Simulating frontend tools the agent can call
const tools = {
  toggleTheme: {
    description: "Toggle between light and dark mode",
    handler: (args, setState) => {
      setState(prev => ({ ...prev, theme: args.theme }));
      return \`Switched to \${args.theme} mode\`;
    },
  },
  setBackground: {
    description: "Change the background color",
    handler: (args, setState) => {
      setState(prev => ({ ...prev, bgColor: args.color }));
      return \`Background set to \${args.color}\`;
    },
  },
  addNotification: {
    description: "Show a notification to the user",
    handler: (args, setState) => {
      setState(prev => ({
        ...prev,
        notifications: [...prev.notifications, args.message],
      }));
      return "Notification displayed";
    },
  },
};

export default function App() {
  const [state, setState] = useState({
    theme: "light",
    bgColor: "#ffffff",
    notifications: [],
    log: [],
  });

  const callTool = (name, args) => {
    const result = tools[name].handler(args, setState);
    setState(prev => ({
      ...prev,
      log: [...prev.log, \`Agent called \${name} → \${result}\`],
    }));
  };

  const isDark = state.theme === "dark";

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: 20,
      background: isDark ? "#1a1a2e" : state.bgColor,
      color: isDark ? "#e5e7eb" : "#374151",
      minHeight: 300,
      transition: "all 0.3s ease",
    }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
        Frontend Tool Playground
      </h2>

      {/* Notifications */}
      {state.notifications.map((msg, i) => (
        <div key={i} style={{
          padding: "8px 12px", marginBottom: 8, borderRadius: 8,
          background: isDark ? "rgba(133, 224, 206, 0.2)" : "#ecfdf5",
          border: \`1px solid \${isDark ? "rgba(133, 224, 206, 0.3)" : "#a7f3d0"}\`,
          fontSize: 13,
        }}>
          {msg}
        </div>
      ))}

      {/* Tool buttons (simulating agent tool calls) */}
      <p style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#6b7280", marginBottom: 8 }}>
        Click buttons to simulate the agent calling frontend tools:
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <ToolButton
          label="Toggle Dark Mode"
          onClick={() => callTool("toggleTheme", { theme: isDark ? "light" : "dark" })}
          isDark={isDark}
        />
        <ToolButton
          label="Pink Background"
          onClick={() => callTool("setBackground", { color: "#fce7f3" })}
          isDark={isDark}
        />
        <ToolButton
          label="Blue Background"
          onClick={() => callTool("setBackground", { color: "#dbeafe" })}
          isDark={isDark}
        />
        <ToolButton
          label="Notify: Hello!"
          onClick={() => callTool("addNotification", { message: "Hello from the agent! 👋" })}
          isDark={isDark}
        />
      </div>

      {/* Tool call log */}
      {state.log.length > 0 && (
        <div style={{
          padding: 12, borderRadius: 8, fontSize: 12,
          background: isDark ? "rgba(255,255,255,0.05)" : "#f9fafb",
          border: \`1px solid \${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}\`,
          fontFamily: "monospace",
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Tool Call Log:
          </div>
          {state.log.map((entry, i) => (
            <div key={i} style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>
              {entry}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ToolButton({ label, onClick, isDark }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px", borderRadius: 8, border: "none",
        background: isDark ? "rgba(190, 194, 255, 0.2)" : "#9599CC",
        color: isDark ? "#BEC2FF" : "#fff",
        cursor: "pointer", fontWeight: 600, fontSize: 12,
      }}
    >
      {label}
    </button>
  );
}`,
      },
    },
  ],
};
