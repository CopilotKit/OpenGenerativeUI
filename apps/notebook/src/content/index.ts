import { introduction } from "./chapters/01-introduction";
import { widgetRenderer } from "./chapters/02-agent-state";
import { copilotKitIntegration } from "./chapters/03-generative-ui";
import { deepAgent } from "./chapters/04-copilotkit-hooks";
import { agentSkills } from "./chapters/05-frontend-tools";
import { fullFlow } from "./chapters/06-widget-renderer";
import type { Chapter } from "@/lib/types";

export const chapters: Chapter[] = [
  introduction,
  deepAgent,
  agentSkills,
  copilotKitIntegration,
  widgetRenderer,
  fullFlow,
];
