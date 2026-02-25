import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import { summarizeRouter } from "./routes/summarize";
import { uploadRouter } from "./routes/upload";
import { historyRouter } from "./routes/history";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Health Check ────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────────────────
app.use("/api", summarizeRouter);
app.use("/api", uploadRouter);
app.use("/api", historyRouter);

// ─── Error Handler ───────────────────────────────────────
app.use(errorHandler);

// ─── Connect DB & Start ──────────────────────────────────
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   MongoDB:      connected`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export default app;
