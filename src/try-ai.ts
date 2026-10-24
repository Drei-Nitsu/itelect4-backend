import "dotenv/config";
import { askGemini } from "./lib/gemini.js";
import { AiReplySchema } from "./schemas/ai.js";

const TEST_PROMPT =
  "A student project management system built with React, Node.js, Express, and MongoDB. " +
  "Students can register, log in, submit code repositories for courses, and track their tasks. " +
  "It includes JWT authentication and is deployed on Vercel.";

async function main() {
  console.log("Sending test prompt to Gemini…\n");

  const raw = await askGemini(TEST_PROMPT);
  console.log("Raw response:\n", raw, "\n");

  const parsed = AiReplySchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    console.error("❌ Reply did not match schema:", parsed.error.issues);
    process.exit(1);
  }

  console.log("✅ Parsed reply:");
  console.log("  rating:     ", parsed.data.rating);
  console.log("  summary:    ", parsed.data.summary);
  console.log("  strengths:  ", parsed.data.strengths);
  console.log("  suggestions:", parsed.data.suggestions);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

