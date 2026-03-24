import "dotenv/config";
import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "../routes/index.js";
import { globalLimiter, authRouteLimiter } from "./rateLimiters.js";
import { corsOptions } from "./corsOptions.js";
import { errorHandler } from "../middleware/errorHandler.js";
import { startServer } from "./startServer.js";

const testing =
  process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);

const app: Express = express();
app.set("trust proxy", 1);

app.use(globalLimiter);
app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(express.static("public"));

app.use("/api/auth", authRouteLimiter);
app.use("/api", apiRoutes);
app.use(errorHandler);

if (!testing) void startServer(app);

export default app;
