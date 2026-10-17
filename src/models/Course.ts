import { Schema, model } from "mongoose";

export interface CourseDoc {
  code: string;
  title: string;
  description: string;
  credits: number;
}

const courseSchema = new Schema<CourseDoc>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    credits: { type: Number, required: true, min: 1 },
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

export const Course = model<CourseDoc>("Course", courseSchema);

