import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { OpenGenUIPromptBridge } from "@/lib/sandbox/prompt-bridge";
import { SEND_PROMPT_EVENT } from "@/lib/sandbox/sandbox-functions";

const addMessage = vi.fn();
const runAgent = vi.fn();
const fakeAgent = { addMessage };
const fakeCopilotKit = { runAgent };

vi.mock("@copilotkit/react-core/v2", () => ({
  useAgent: () => ({ agent: fakeAgent }),
  useCopilotKit: () => ({ copilotkit: fakeCopilotKit }),
}));

const dispatchSendPrompt = (text: string) => {
  window.dispatchEvent(
    new CustomEvent(SEND_PROMPT_EVENT, { detail: { text } })
  );
};

describe("OpenGenUIPromptBridge", () => {
  beforeEach(() => {
    addMessage.mockClear();
    runAgent.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders nothing", () => {
    const { container } = render(<OpenGenUIPromptBridge />);
    expect(container).toBeEmptyDOMElement();
  });

  it("submits the prompt via addMessage and runAgent", () => {
    render(<OpenGenUIPromptBridge />);
    dispatchSendPrompt("draw a chart");

    expect(addMessage).toHaveBeenCalledTimes(1);
    expect(addMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        content: "draw a chart",
        role: "user",
      })
    );
    expect(runAgent).toHaveBeenCalledTimes(1);
    expect(runAgent).toHaveBeenCalledWith({ agent: fakeAgent });
  });

  it("ignores events without a string text", () => {
    render(<OpenGenUIPromptBridge />);
    window.dispatchEvent(
      new CustomEvent(SEND_PROMPT_EVENT, { detail: { text: 42 } })
    );
    window.dispatchEvent(new CustomEvent(SEND_PROMPT_EVENT));

    expect(addMessage).not.toHaveBeenCalled();
    expect(runAgent).not.toHaveBeenCalled();
  });

  it("removes the listener on unmount", () => {
    const { unmount } = render(<OpenGenUIPromptBridge />);
    dispatchSendPrompt("first");
    expect(addMessage).toHaveBeenCalledTimes(1);
    expect(runAgent).toHaveBeenCalledTimes(1);

    unmount();
    dispatchSendPrompt("second");
    expect(addMessage).toHaveBeenCalledTimes(1);
    expect(runAgent).toHaveBeenCalledTimes(1);
  });
});
