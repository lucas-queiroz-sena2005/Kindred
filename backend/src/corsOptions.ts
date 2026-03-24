import type { CorsOptions } from "cors";
import { parseCorsOrigins } from "../utils/envParse.js";

const allowed = parseCorsOrigins(
  process.env.FRONTEND_URL,
  "http://localhost:5173",
);

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    const normalized = origin.replace(/\/+$/, "");
    if (allowed.includes(normalized)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS: origin not allowed: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
