import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export interface TokenPayload {
  userId: string;
}

/**
 * Requires a valid `Authorization: Bearer <token>` header.
 * On success sets `req.userId`; otherwise responds 401.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or malformed Authorization header" });
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // A misconfigured server is a 500, not a client auth failure.
    next(new Error("JWT_SECRET is not set"));
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
