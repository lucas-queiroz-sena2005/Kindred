import "dotenv/config";
import express, { Request, Response, NextFunction, Express } from "express";
import pool from "../db/db.js";
import apiRoutes from "../routes/index.js";
import { ApiError } from "../errors/customErrors.js";
import cors from "cors";
import cookieParser from "cookie-parser";


const PORT = process.env.PORT || 3001;
const app: Express = express();

const corsOptions = {
  origin: `http://localhost:${PORT}`,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())
app.use(express.static("public"));
app.use("/api", apiRoutes);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("🔴 Error caught by global handler:", err.stack);

  // Handle custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  // Handle JSON parsing errors from body-parser
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body contains malformed JSON.",
    });
  }

  // Fallback for all other errors
  res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred on the server.",
  });
});

async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log(
      "✅ Database connection successful. Server time:",
      result.rows[0].now
    );
    client.release();
  } catch (err) {
    console.error("🔴 Error connecting to the database:", err);
    process.exit(1);
  }
}

async function startServer() {
  await testDatabaseConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

startServer();
