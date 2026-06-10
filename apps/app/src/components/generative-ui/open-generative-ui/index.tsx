import type { ReactActivityMessageRenderer } from "@copilotkit/react-core/v2";
import { OpenGenUIActivityRenderer, LOADING_PHRASES } from "./renderer";
import {
  OPEN_GENERATIVE_UI_ACTIVITY_TYPE,
  OpenGenUIContentSchema,
  type OpenGenUIContent,
} from "./schema";

export { OpenGenUIActivityRenderer, LOADING_PHRASES };
export { OPEN_GENERATIVE_UI_ACTIVITY_TYPE, OpenGenUIContentSchema };
export type { OpenGenUIContent };

// Stable module-level renderer registration. Drop into CopilotKitProvider's
// renderActivityMessages to override the built-in open-generative-ui renderer
// (user-supplied renderers win the activityType lookup).
export const OPEN_GEN_UI_ACTIVITY_RENDERER = {
  activityType: OPEN_GENERATIVE_UI_ACTIVITY_TYPE,
  content: OpenGenUIContentSchema,
  render: OpenGenUIActivityRenderer,
} satisfies ReactActivityMessageRenderer<OpenGenUIContent>;
