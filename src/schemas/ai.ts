import { z } from "zod";

/* ------------------------------------------------------------------ *
 *  REQUEST schema – what the client sends to POST /api/ai
 * ------------------------------------------------------------------ */
export const AiRequestSchema = z.object({
  prompt: z
    .string()
    .transform((s) => s.trim())
    .pipe(
      z
        .string()
        .min(20, "Prompt must be at least 20 characters after trimming")
        .max(2000, "Prompt must be at most 2000 characters after trimming")
    ),
});

export type AiRequest = z.infer<typeof AiRequestSchema>;

/* ------------------------------------------------------------------ *
 *  REPLY schema – the structured JSON Gemini must return
 *
 *  Fields:
 *    rating    – one of five fixed levels (z.enum)
 *    summary   – a short paragraph about the project
 *    strengths – string[] of positive points (array field)
 *    suggestions – string[] of improvement ideas (array field)
 * ------------------------------------------------------------------ */
export const AiReplySchema = z.object({
  rating: z.enum([
    "excellent",
    "good",
    "satisfactory",
    "needs_improvement",
    "poor",
  ]),
  summary: z.string(),
  strengths: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export type AiReply = z.infer<typeof AiReplySchema>;

