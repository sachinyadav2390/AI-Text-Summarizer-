import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import { summarizeRouter } from "./routes/summarize";
import { uploadRouter } from "./routes/upload";
import { historyRouter } from "./routes/history";
import { contactRouter } from "./routes/contact";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────
app.use(cors({ 
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"], 
  credentials: true 
}));
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
app.use("/api", contactRouter);

// ─── Error Handler ───────────────────────────────────────
app.use(errorHandler);

// ─── Connect DB & Start ──────────────────────────────────
async function startServer() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   MongoDB:      connected`);
  });

  // AI inference on CPU can take 30-90s — increase timeout to 3 min
  server.timeout = 180_000;
  server.keepAliveTimeout = 180_000;
  server.headersTimeout = 185_000;
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export default app;
