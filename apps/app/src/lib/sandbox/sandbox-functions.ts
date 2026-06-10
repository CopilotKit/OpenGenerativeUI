import { z } from "zod";
import type { SandboxFunction } from "@copilotkit/react-core/v2";

export const SEND_PROMPT_EVENT = "opengenui:send-prompt";

const formatIssues = (error: z.ZodError) =>
  error.issues
    .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("; ");

const sendPromptParameters = z.object({
  text: z.string().min(1).max(4000),
});

export const sendPromptFunction: SandboxFunction = {
  name: "sendPrompt",
  description:
    "Sends a message to the chat as if the user typed it. Call as: await Websandbox.connection.remote.sendPrompt({ text }).",
  parameters: sendPromptParameters,
  handler: async (args) => {
    const result = sendPromptParameters.safeParse(args);
    if (!result.success) {
      throw new Error(`sendPrompt: invalid arguments — ${formatIssues(result.error)}`);
    }
    window.dispatchEvent(
      new CustomEvent(SEND_PROMPT_EVENT, { detail: { text: result.data.text } })
    );
    return { ok: true };
  },
};

const openLinkParameters = z.object({
  url: z.string().url(),
});

const envAllowedOrigins = (): string[] | undefined => {
  const raw = process.env.NEXT_PUBLIC_OPEN_LINK_ALLOWED_ORIGINS;
  if (!raw) return undefined;
  const origins = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins : undefined;
};

export function isAllowedLinkUrl(
  url: string,
  allowedOrigins?: readonly string[]
): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  const origins = allowedOrigins ?? envAllowedOrigins();
  if (origins) return origins.includes(parsed.origin);
  return true;
}

export const openLinkFunction: SandboxFunction = {
  name: "openLink",
  description:
    "Opens an https link in a new browser tab. Call as: await Websandbox.connection.remote.openLink({ url }).",
  parameters: openLinkParameters,
  handler: async (args) => {
    const result = openLinkParameters.safeParse(args);
    if (!result.success) {
      throw new Error(`openLink: invalid arguments — ${formatIssues(result.error)}`);
    }
    const { url } = result.data;
    if (!isAllowedLinkUrl(url)) {
      throw new Error(`openLink: url not allowed — ${url}`);
    }
    window.open(url, "_blank", "noopener,noreferrer");
    return { ok: true };
  },
};

export const SANDBOX_FUNCTIONS: readonly SandboxFunction[] = [
  sendPromptFunction,
  openLinkFunction,
];
