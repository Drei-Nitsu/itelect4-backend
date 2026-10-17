import { Router } from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Course } from "../models/Course.js";

export const courseRouter = Router();

// GET /api/courses — list all courses (public, no auth).
courseRouter.get("/", async (_req: Request, res: Response) => {
  const courses = await Course.find().sort({ code: 1 });
  res.json(courses);
});

// GET /api/courses/:id — single course by id (public, no auth).
courseRouter.get("/:id", async (req: Request, res: Response) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  res.json(course);
});

