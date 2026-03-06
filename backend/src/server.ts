import "dotenv/config";
import express, { Request, Response, NextFunction, Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import pool from "../db/db.js";
import apiRoutes from "../routes/index.js";
import { ApiError } from "../errors/customErrors.js";
import { startJobs } from "../jobs/index.js";
import { TmdbSyncService } from "../services/jobs/tmdbSyncService.js";

const app: Express = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === "production";
const IS_TESTING = process.env.NODE_ENV === "test" || process.env.VITEST;
app.set("trust proxy", "172.18.0.0/16");

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too Many Requests",
    message: "Global rate limit exceeded. Please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Security Limit Exceeded",
    message: "Too many authentication attempts. Please try again in an hour.",
  },
});

app.use(globalLimiter);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(express.static("public"));

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));

app.use("/api/auth", authLimiter);
app.use("/api", apiRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const now = new Date().toISOString();

  console.error(`[${now}] 🔴 ERROR [${req.method}] ${req.path}`);
  console.error(`Stack: ${err.stack}`);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      error: "Malformed JSON",
      message: "The request body contains invalid JSON formatting.",
    });
  }

  res.status(500).json({
    error: "Internal Server Error",
    message: IS_PROD
      ? "An unexpected error occurred. Please contact support if this persists."
      : err.message,
  });
});

async function testDatabaseConnection() {
  const start = Date.now();
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    const latency = Date.now() - start;

    console.log(`✅ [DATABASE] Connection established in ${latency}ms.`);
    console.log(`🕒 [DATABASE] Current Server Time: ${result.rows[0].now}`);

    client.release();
  } catch (err) {
    console.error("❌ [DATABASE] Critical connection failure:", err);
    process.exit(1);
  }
}

async function startServer() {
  console.log("--------------------------------------------------");
  console.log("🛠️  Initializing Kindred Production Server...");

  await testDatabaseConnection();

  // External Service Syncing
  try {
    await TmdbSyncService.updateConfiguration();
    console.log("🎬 [TMDB] Configuration updated successfully.");
  } catch (e) {
    console.error(
      "⚠️  [TMDB] Sync failed during startup, using cached config.",
    );
  }

  startJobs();

  app.listen(PORT, () => {
    console.log(`🚀 [SERVER] Listening at http://localhost:${PORT}`);
    console.log(
      `🏷️  [SERVER] Environment: ${process.env.NODE_ENV || "development"}`,
    );
    console.log("--------------------------------------------------");
  });
}

if (!IS_TESTING) {
  startServer();
}

export default app;
