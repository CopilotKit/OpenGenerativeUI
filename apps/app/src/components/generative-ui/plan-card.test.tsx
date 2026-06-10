import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PlanCard } from "@/components/generative-ui/plan-card";

describe("PlanCard", () => {
  it("renders the completed plan with technology and key elements", () => {
    render(
      <PlanCard
        status="complete"
        approach="Render a bar chart of monthly revenue"
        technology="inline SVG"
        keyElements={["12 bars", "axis labels"]}
      />
    );

    expect(screen.getByText("Plan: inline SVG")).toBeInTheDocument();
    expect(
      screen.getByText("Render a bar chart of monthly revenue")
    ).toBeInTheDocument();
    expect(screen.getByText("12 bars")).toBeInTheDocument();
  });
});
