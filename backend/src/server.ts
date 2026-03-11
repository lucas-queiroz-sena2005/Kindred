import "dotenv/config";
import express, { Request, Response, NextFunction, Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../db/db.js";
import apiRoutes from "../routes/index.js";
import { ApiError } from "../errors/customErrors.js";
import { startJobs } from "../jobs/index.js";
import { TmdbSyncService } from "../services/jobs/tmdbSyncService.js";

const app: Express = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === "production";
const IS_TESTING = process.env.NODE_ENV === "test" || process.env.VITEST;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set("trust proxy", 1);

const limiter = (windowMs: number, max: number, message: string) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Rate Limit Exceeded", message },
  });

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(limiter(15 * 60 * 1000, 100, "Global limit exceeded."));
app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(express.static("public"));

app.use("/api/auth", limiter(60 * 60 * 1000, 15, "Too many login attempts."));
app.use("/api", apiRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err instanceof ApiError ? err.statusCode : 500;

  if (!IS_TESTING) {
    console.error(
      `[${new Date().toISOString()}] 🔴 ${req.method} ${req.path} - ${err.message}`,
    );
    if (status === 500) console.error(err.stack);
  }

  if (err instanceof SyntaxError && "body" in err) {
    return res
      .status(400)
      .json({ error: "Invalid JSON", message: "Malformed body." });
  }

  res.status(status).json({
    error: err.name || "InternalError",
    message:
      IS_PROD && status === 500
        ? "Something went wrong on our end."
        : err.message,
  });
});

async function syncSchema(client: any) {
  try {
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log(
        "📂 [DB] No schema detected. Initializing from database.sql...",
      );
      const sqlPath = path.join(__dirname, "../../db/database.sql");
      const sql = fs.readFileSync(sqlPath, "utf8");

      await client.query(sql);
      console.log("✅ [DB] Schema initialized successfully.");
    } else {
      console.log("💎 [DB] Schema verified (tables exist).");
    }
  } catch (err) {
    console.error("❌ [DB] Schema sync failed:", err);
    throw err;
  }
}

async function bootstrap() {
  let client;
  try {
    const start = Date.now();
    client = await pool.connect();

    await syncSchema(client);
    console.log(`✅ [DB] Connected & Synced (${Date.now() - start}ms)`);

    await TmdbSyncService.updateConfiguration().catch(() =>
      console.warn("⚠️  [TMDB] Sync failed, using cache."),
    );

    startJobs();

    app.listen(PORT, () => {
      console.log(
        `🚀 [SERVER] Running on port ${PORT} [${process.env.NODE_ENV}]`,
      );
    });
  } catch (err) {
    console.error("❌ [FATAL] Startup failed:", err);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

if (!IS_TESTING) bootstrap();

export default app;
