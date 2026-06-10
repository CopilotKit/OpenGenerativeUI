import { render, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const captured = vi.hoisted(() => ({
  useComponent: [] as Array<{ name: string }>,
  useFrontendTool: [] as Array<{ name: string }>,
  useHumanInTheLoop: [] as Array<{ name: string }>,
  useRenderTool: [] as Array<{ name: string }>,
  useDefaultRenderTool: 0,
}));

vi.mock("@copilotkit/react-core/v2", () => ({
  useComponent: (config: { name: string }) => {
    captured.useComponent.push(config);
  },
  useFrontendTool: (config: { name: string }) => {
    captured.useFrontendTool.push(config);
  },
  useHumanInTheLoop: (config: { name: string }) => {
    captured.useHumanInTheLoop.push(config);
  },
  useRenderTool: (config: { name: string }) => {
    captured.useRenderTool.push(config);
  },
  useDefaultRenderTool: () => {
    captured.useDefaultRenderTool += 1;
  },
}));

vi.mock("@/hooks/use-theme", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

import { useGenerativeUIExamples } from "../use-generative-ui-examples";

function Probe() {
  useGenerativeUIExamples();
  return null;
}

const LEGACY_NAME = ["widget", "Renderer"].join("");

describe("useGenerativeUIExamples registrations", () => {
  beforeEach(() => {
    captured.useComponent.length = 0;
    captured.useFrontendTool.length = 0;
    captured.useHumanInTheLoop.length = 0;
    captured.useRenderTool.length = 0;
    captured.useDefaultRenderTool = 0;
  });

  afterEach(() => {
    cleanup();
  });

  it("registers exactly pieChart and barChart via useComponent", () => {
    render(<Probe />);
    expect(captured.useComponent.map((c) => c.name)).toEqual([
      "pieChart",
      "barChart",
    ]);
  });

  it("does not register the legacy widget renderer component", () => {
    render(<Probe />);
    expect(captured.useComponent.map((c) => c.name)).not.toContain(LEGACY_NAME);
  });

  it("keeps the remaining demo registrations intact", () => {
    render(<Probe />);
    expect(captured.useFrontendTool.map((c) => c.name)).toEqual(["toggleTheme"]);
    expect(captured.useRenderTool.map((c) => c.name)).toEqual([
      "plan_visualization",
    ]);
    expect(captured.useHumanInTheLoop.map((c) => c.name)).toEqual([
      "scheduleTime",
    ]);
    expect(captured.useDefaultRenderTool).toBe(1);
  });
});
