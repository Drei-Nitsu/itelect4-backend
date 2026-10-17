import "dotenv/config";
import mongoose from "mongoose";
import { Course } from "./models/Course.js";

const COURSES = [
  {
    code: "ITELECT4",
    title: "IT Elective 4: Web Development with React and TypeScript",
    description: "An advanced course on modern web development techniques.",
    credits: 3,
  },
  {
    code: "ITELECT3",
    title: "IT Elective 3: Backend Development with Node.js",
    description: "Server-side programming with Express and MongoDB.",
    credits: 3,
  },
  {
    code: "CS101",
    title: "Introduction to Computer Science",
    description: "Fundamental concepts of computing and programming.",
    credits: 3,
  },
  {
    code: "CS201",
    title: "Data Structures and Algorithms",
    description: "Study of fundamental data structures and algorithm design.",
    credits: 3,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to your .env file.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  for (const course of COURSES) {
    const result = await Course.updateOne(
      { code: course.code },
      { $set: course },
      { upsert: true }
    );
    const action = result.upsertedCount ? "inserted" : "updated";
    console.log(`  ${action} ${course.code}`);
  }

  console.log("Seed complete");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

