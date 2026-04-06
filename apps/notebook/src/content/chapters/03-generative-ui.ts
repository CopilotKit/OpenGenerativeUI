import type { Chapter } from "@/lib/types";

export const generativeUi: Chapter = {
  id: "generative-ui",
  title: "Generative UI",
  description:
    "How the agent generates rich, interactive UI components beyond text.",
  icon: "🎨",
  cells: [
    {
      type: "markdown",
      id: "genui-concept",
      content: `# Generative UI

The most powerful feature of OpenGenerativeUI is **Generative UI** — the agent doesn't just return text responses, it renders **actual React components** in the chat stream.

This means the agent can produce:
- **Charts** (bar charts, pie charts) with real data
- **Interactive widgets** (HTML/SVG/3D rendered in sandboxed iframes)
- **Planning cards** that show the agent's thinking process
- **Forms** for human-in-the-loop interactions

## How it works

CopilotKit provides hooks to register "component tools" that the agent can call. When the agent calls one of these tools, instead of returning text, it renders a React component with the tool's parameters as props.`,
    },
    {
      type: "code",
      id: "genui-register",
      language: "tsx",
      filename: "apps/app/src/hooks/use-generative-ui-examples.tsx",
      content: `import { useComponent } from "@copilotkit/react-core";
import { PieChart, PieChartProps } from "../components/generative-ui/charts/pie-chart";
import { BarChart, BarChartProps } from "../components/generative-ui/charts/bar-chart";
import { WidgetRenderer, WidgetProps } from "../components/generative-ui/widget-renderer";

export function useGenerativeUIExamples() {
  // Register a pie chart component the agent can render
  useComponent("pieChart", {
    component: PieChart,
    schema: PieChartProps,    // Zod schema for props validation
    description: "Render a pie chart with labeled data segments",
  });

  // Register a bar chart
  useComponent("barChart", {
    component: BarChart,
    schema: BarChartProps,
    description: "Render a bar chart with labeled data",
  });

  // Register the widget renderer (most flexible - renders any HTML)
  useComponent("widgetRenderer", {
    component: WidgetRenderer,
    schema: WidgetProps,
    description: "Render interactive HTML/SVG/3D visualizations",
  });
}`,
    },
    {
      type: "markdown",
      id: "genui-props",
      content: `## Props are validated with Zod

Each component tool defines a **Zod schema** for its props. This serves two purposes:
1. The agent sees the schema as part of the tool description, so it knows exactly what data to provide
2. Props are validated before the component renders, preventing runtime errors`,
    },
    {
      type: "code",
      id: "genui-zod",
      language: "tsx",
      filename: "Chart props schema",
      content: `import { z } from "zod";

export const PieChartProps = z.object({
  title: z.string().describe("The title displayed above the chart"),
  description: z.string().describe("A brief description of the data"),
  data: z.array(
    z.object({
      label: z.string().describe("Segment label"),
      value: z.number().describe("Segment value"),
    })
  ).describe("The data segments for the pie chart"),
});`,
    },
    {
      type: "playground",
      id: "genui-chart-playground",
      title: "Try it: Build a Chart Component",
      dependencies: { recharts: "2.12.7" },
      files: {
        "/App.js": `import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#9599CC", "#85E0CE", "#BEC2FF", "#A8E9DC", "#D4D7FF", "#1B936F"];

// Try editing this data!
const data = [
  { label: "React", value: 40 },
  { label: "Python", value: 25 },
  { label: "TypeScript", value: 20 },
  { label: "CSS", value: 15 },
];

export default function App() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 20 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
        Languages Used
      </h3>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
        Distribution of languages in the codebase
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={90}
            strokeWidth={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}`,
      },
    },
    {
      type: "markdown",
      id: "genui-widget",
      content: `## The Widget Renderer

The most flexible generative UI component is the **Widget Renderer**. It takes arbitrary HTML/SVG/CSS and renders it in a **sandboxed iframe** with:

- A full design system (CSS variables, fonts)
- Import maps for libraries (Three.js, D3, GSAP, Chart.js)
- A communication bridge (\`window.sendPrompt()\` to send messages back to the agent)
- Auto-resizing based on content height
- Efficient streaming updates via Idiomorph DOM diffing

This is what enables the agent to produce 3D visualizations, interactive diagrams, and custom widgets on the fly.`,
    },
  ],
};
