import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import type { UserDoc } from "../types/index.js";

const SALT_ROUNDS = 10;

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "admin", "instructor"],
      default: "student",
    },
    isActive: { type: Boolean, default: true },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
  },
  {
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

export const User = model<UserDoc>("User", userSchema);
