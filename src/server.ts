import "dotenv/config";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = Number(process.env.PORT) || 4000;

// Connect to MongoDB first, and only start accepting requests once the
// database is reachable.
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error(
      "Failed to start server:",
      err instanceof Error ? err.message : err
    );
    process.exit(1);
  });
