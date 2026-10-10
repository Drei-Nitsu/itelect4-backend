import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { authRouter } from "./routes/auth.js";
import { submissionRouter } from "./routes/submissions.js";

export const app = express();

app.use(cors());
app.use(express.json());

// --- Health check ---------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

// --- Routers -------------------------------------------------------------
app.use("/api/auth", authRouter);
app.use("/api/submissions", submissionRouter);

// --- 404: no route matched ----------------------------------------------
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Not Found: ${req.method} ${req.originalUrl}` });
});

// --- Centralized error handler ------------------------------------------
// Must be last, and must declare all four parameters for Express to treat
// it as an error handler.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // Invalid input -> 400, with the field-level detail mongoose produced.
  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }

  // Unique-index violation -> 409. Mongo reports this as E11000 rather than
  // a mongoose ValidationError, so it needs its own branch.
  if (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: unknown }).code === 11000
  ) {
    const keyValue = (err as { keyValue?: Record<string, unknown> }).keyValue;
    const field = keyValue ? Object.keys(keyValue)[0] : undefined;
    res.status(409).json({
      error: field ? field + " already exists" : "Duplicate value",
    });
    return;
  }

  const status =
    typeof err === "object" && err !== null && "status" in err
      ? Number((err as { status: unknown }).status) || 500
      : 500;

  const message = err instanceof Error ? err.message : "Internal Server Error";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
});

export default app;
