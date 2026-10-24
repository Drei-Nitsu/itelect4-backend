import { Router } from "express";
import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.js";
import { AiRequestSchema, AiReplySchema } from "../schemas/ai.js";
import { askGemini } from "../lib/gemini.js";

export const aiRouter = Router();

/* ------------------------------------------------------------------ *
 *  Rate limiter – keyed on req.userId (set by requireAuth)
 * ------------------------------------------------------------------ */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,            // 1 minute window
  max: 5,                          // 5 requests per window per user
  keyGenerator: (req: Request) => req.userId ?? req.ip ?? "anon",
  message: { error: "Too many AI requests. Please wait a minute and try again." },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ------------------------------------------------------------------ *
 *  POST /api/ai
 * ------------------------------------------------------------------ */
aiRouter.post("/", requireAuth, aiLimiter, async (req: Request, res: Response) => {
  // 1. Validate request body
  const parsed = AiRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid request: " + parsed.error.issues.map((i) => i.message).join(", "),
    });
    return;
  }

  // 2. Call Gemini
  let rawText: string;
  try {
    rawText = await askGemini(parsed.data.prompt);
  } catch (err: unknown) {
    // Gemini quota / rate limit → 429
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("429") || message.toLowerCase().includes("quota")) {
      res.status(429).json({
        error: "Gemini API quota exceeded. Please try again later.",
      });
      return;
    }
    // Any other Gemini error → 502
    console.error("Gemini call failed:", err);
    res.status(502).json({ error: "AI service is temporarily unavailable." });
    return;
  }

  // 3. Parse and validate the reply
  let json: unknown;
  try {
    json = JSON.parse(rawText);
  } catch {
    console.error("Gemini returned non-JSON:", rawText);
    res.status(502).json({ error: "AI returned an invalid response. Please try again." });
    return;
  }

  const reply = AiReplySchema.safeParse(json);
  if (!reply.success) {
    console.error("Gemini reply failed schema validation:", reply.error.issues, json);
    res.status(502).json({ error: "AI returned an unexpected format. Please try again." });
    return;
  }

  res.json(reply.data);
});

