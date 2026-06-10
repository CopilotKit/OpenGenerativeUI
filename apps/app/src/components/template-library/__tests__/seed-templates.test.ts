import { describe, it, expect } from "vitest";
import { SEED_TEMPLATES, SEED_IDS } from "../seed-templates";

describe("seed templates", () => {
  it("covers exactly the three seed ids", () => {
    expect(SEED_TEMPLATES.map((t) => t.id).sort()).toEqual(
      [...SEED_IDS].sort()
    );
    for (const t of SEED_TEMPLATES) {
      expect(t.html.trim()).not.toBe("");
    }
  });

  it("never uses the retired global sendPrompt('...') idiom", () => {
    // Inside the websandbox iframe there is no global sendPrompt — only the
    // RPC bridge. Seeds are handed to the model as style references, so a
    // legacy idiom here teaches the model to emit dead buttons.
    for (const t of SEED_TEMPLATES) {
      expect(t.html).not.toContain("sendPrompt('");
      expect(t.html).not.toContain('sendPrompt("');
    }
  });

  it("wires interactive buttons through the sandbox bridge", () => {
    const invoice = SEED_TEMPLATES.find((t) => t.id === "seed-invoice-001")!;
    expect(invoice.html).toContain("Websandbox.connection.remote.sendPrompt({ text:");
  });
});
