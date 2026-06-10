import { z } from "zod";

export const OPEN_GENERATIVE_UI_ACTIVITY_TYPE = "open-generative-ui";

// Activity content emitted by the runtime's OpenGenerativeUIMiddleware.
// Defined locally — @copilotkit/react-core/v2 does not export its
// OpenGenerativeUIContentSchema.
export const OpenGenUIContentSchema = z.object({
  initialHeight: z.number().optional(),
  generating: z.boolean().optional(),
  css: z.string().optional(),
  cssComplete: z.boolean().optional(),
  html: z.array(z.string()).optional(),
  htmlComplete: z.boolean().optional(),
  jsFunctions: z.string().optional(),
  jsFunctionsComplete: z.boolean().optional(),
  jsExpressions: z.array(z.string()).optional(),
  jsExpressionsComplete: z.boolean().optional(),
});

export type OpenGenUIContent = z.infer<typeof OpenGenUIContentSchema>;
