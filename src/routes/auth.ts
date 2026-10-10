import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import type { TokenPayload } from "../middleware/auth.js";

export const authRouter = Router();

const TOKEN_TTL = "2h";

const normalizeEmail = (email: unknown): string =>
  String(email).toLowerCase().trim();

authRouter.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email and password are required" });
    return;
  }

  const exists = await User.findOne({ email: normalizeEmail(email) });
  if (exists) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const user = await User.create({ name, email, password });
  res.status(201).json(user.toJSON());
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  // `password` is `select: false` on the schema, so ask for it explicitly.
  const user = await User.findOne({ email: normalizeEmail(email) }).select(
    "+password"
  );

  // Same response for unknown email and wrong password, so the endpoint
  // does not reveal which emails are registered.
  if (!user || !(await bcrypt.compare(String(password), user.password))) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  const payload: TokenPayload = { userId: String(user._id) };
  const token = jwt.sign(payload, secret, { expiresIn: TOKEN_TTL });

  res.json({ token, user: user.toJSON() });
});
