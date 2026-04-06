import { introduction } from "./chapters/01-introduction";
import { agentState } from "./chapters/02-agent-state";
import { generativeUi } from "./chapters/03-generative-ui";
import { copilotKitHooks } from "./chapters/04-copilotkit-hooks";
import { frontendTools } from "./chapters/05-frontend-tools";
import { widgetRenderer } from "./chapters/06-widget-renderer";
import type { Chapter } from "@/lib/types";

export const chapters: Chapter[] = [
  introduction,
  agentState,
  generativeUi,
  copilotKitHooks,
  frontendTools,
  widgetRenderer,
];
