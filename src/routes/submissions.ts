import { Router } from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Submission } from "../models/Submission.js";
import { requireAuth } from "../middleware/auth.js";
import type { SubmissionDoc } from "../types/index.js";

export const submissionRouter = Router();

// Every route below requires a valid token.
submissionRouter.use(requireAuth);

const NOT_FOUND = { error: "Submission not found" };

// List — newest first, scoped to the logged-in student.
submissionRouter.get("/", async (req: Request, res: Response) => {
  const submissions = await Submission.find({ studentId: req.userId }).sort({
    submittedAt: -1,
  });
  res.json(submissions);
});

// Read one — by id AND owner.
submissionRouter.get("/:id", async (req: Request, res: Response) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json(NOT_FOUND);
    return;
  }

  const submission = await Submission.findOne({
    _id: req.params.id,
    studentId: req.userId,
  });

  if (!submission) {
    res.status(404).json(NOT_FOUND);
    return;
  }

  res.json(submission);
});

// Create — only these two fields are accepted from the client. The owner
// comes from the token, and `score` is never client-settable (a student must
// not be able to grade their own submission).
submissionRouter.post("/", async (req: Request, res: Response) => {
  const { courseCode, repoUrl } = req.body ?? {};

  const submission = await Submission.create({
    courseCode,
    repoUrl,
    studentId: req.userId,
  });

  res.status(201).json(submission);
});

// Update — by id AND owner.
submissionRouter.patch("/:id", async (req: Request, res: Response) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json(NOT_FOUND);
    return;
  }

  // Whitelist: anything else in the body (studentId, score, _id, ...) is
  // ignored, so ownership and grades cannot be changed by payload tampering.
  const { courseCode, repoUrl } = req.body ?? {};

  const updates: Partial<Pick<SubmissionDoc, "courseCode" | "repoUrl">> = {};
  if (courseCode !== undefined) updates.courseCode = courseCode;
  if (repoUrl !== undefined) updates.repoUrl = repoUrl;

  const submission = await Submission.findOneAndUpdate(
    { _id: req.params.id, studentId: req.userId },
    updates,
    { new: true, runValidators: true }
  );

  if (!submission) {
    res.status(404).json(NOT_FOUND);
    return;
  }

  res.json(submission);
});

// Delete — by id AND owner.
submissionRouter.delete("/:id", async (req: Request, res: Response) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json(NOT_FOUND);
    return;
  }

  const deleted = await Submission.findOneAndDelete({
    _id: req.params.id,
    studentId: req.userId,
  });

  if (!deleted) {
    res.status(404).json(NOT_FOUND);
    return;
  }

  res.status(204).end();
});
