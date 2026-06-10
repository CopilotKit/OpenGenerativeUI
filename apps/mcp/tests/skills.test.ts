import { describe, it, expect } from "vitest";
import { listSkills } from "../src/skills";

describe("listSkills", () => {
  it("returns an array containing the bundled skills", () => {
    const skills = listSkills();
    expect(Array.isArray(skills)).toBe(true);
    expect(skills).toContain("master-agent-playbook");
  });
});
