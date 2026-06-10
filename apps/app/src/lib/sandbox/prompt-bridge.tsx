"use client";

import { useEffect, useRef } from "react";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import { SEND_PROMPT_EVENT } from "./sandbox-functions";

export function OpenGenUIPromptBridge() {
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();

  const agentRef = useRef(agent);
  const copilotkitRef = useRef(copilotkit);
  useEffect(() => { agentRef.current = agent; }, [agent]);
  useEffect(() => { copilotkitRef.current = copilotkit; }, [copilotkit]);

  useEffect(() => {
    const handler = (e: Event) => {
      const text = (e as CustomEvent<{ text?: unknown }>).detail?.text;
      if (typeof text !== "string" || !text) return;
      const a = agentRef.current;
      const ck = copilotkitRef.current;
      a.addMessage({ id: crypto.randomUUID(), content: text, role: "user" });
      ck.runAgent({ agent: a });
    };
    window.addEventListener(SEND_PROMPT_EVENT, handler);
    return () => window.removeEventListener(SEND_PROMPT_EVENT, handler);
  }, []);

  return null;
}
