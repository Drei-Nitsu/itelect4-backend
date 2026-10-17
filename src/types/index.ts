import { Types } from "mongoose";

/* ------------------------------------------------------------------ *
 * Interfaces carried over from the Session 1 types file.
 *
 * One deliberate change: every `id` is `string` here, not `number`.
 * Session 1 ran against json-server; MongoDB issues 24-character
 * ObjectId hex strings, which the models expose as `id` via `toJSON`.
 * ------------------------------------------------------------------ */

export enum TaskStatus {
  Pending = "pending",
  InProgress = "in_progress",
  Completed = "completed",
}

export enum SubmissionStatus {
  Submitted = "Submitted",
  Late = "Late",
  Graded = "Graded",
}

export type Role = "student" | "admin" | "instructor";

export interface Project {
  id: string;
  title: string;
  description: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
}

export interface LogEntry {
  id: string;
  taskId: string;
  action: string;
  timestamp: Date;
}

export interface Course {
  id: string;
  code?: string;
  title: string;
  description: string;
  credits: number;
}

/**
 * Session 1 had `{ id, name, email }`. The backend adds `role` and
 * `isActive` because Session 9 needs authentication; `password` lives on
 * `UserDoc` only, so it can never appear in an API response.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

/** The GT4 resource. Fields match the Session 1 interface exactly. */
export interface Submission {
  id: string;
  studentId: string;
  courseCode: string;
  repoUrl: string;
  submittedAt: Date;
  score?: number;
}

/* ------------------------------------------------------------------ *
 * Derived types used by the Mongoose layer.
 * ------------------------------------------------------------------ */

/**
 * Shape stored in MongoDB: no `id` (Mongo supplies `_id`), plus the hashed
 * password that the API response never includes.
 */
export type UserDoc = Omit<User, "id"> & { password: string };

/**
 * Shape stored in MongoDB: no `id`, and `studentId` is a real ObjectId
 * reference rather than the string the API hands back.
 */
export type SubmissionDoc = Omit<Submission, "id" | "studentId"> & {
  studentId: Types.ObjectId;
};

/**
 * What a client may send when creating a submission — the whitelist the
 * POST and PATCH routes enforce. `studentId` comes from the token,
 * `submittedAt` defaults server-side, and `score` is never client-settable.
 */
export type NewSubmissionBody = Pick<Submission, "courseCode" | "repoUrl">;
