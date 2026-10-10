import { Schema, model } from "mongoose";
import type { SubmissionDoc } from "../types/index.js";

const GITHUB_REPO_URL = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/i;

const submissionSchema = new Schema<SubmissionDoc>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    repoUrl: {
      type: String,
      required: true,
      match: [GITHUB_REPO_URL, "repoUrl must be a github.com repository URL"],
    },
    submittedAt: { type: Date, default: Date.now },
    score: { type: Number, min: 0, max: 100 },
  },
  {
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Submission = model<SubmissionDoc>("Submission", submissionSchema);
