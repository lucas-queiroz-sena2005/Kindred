import type { ErrorRequestHandler } from "express";
import { ApiError } from "../errors/customErrors.js";
import { authConfig } from "../config/authConfig.js";

const testing =
  process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const status = err instanceof ApiError ? err.statusCode : 500;

  if (!testing) {
    console.error(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${err.message}`,
    );
    if (status === 500) console.error(err.stack);
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: "Invalid JSON", message: "Malformed body." });
    return;
  }

  res.status(status).json({
    error: err.name || "InternalError",
    message:
      authConfig.IS_PRODUCTION && status === 500
        ? "Something went wrong on our end."
        : err.message,
  });
};
