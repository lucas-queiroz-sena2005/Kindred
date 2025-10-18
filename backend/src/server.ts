import "dotenv/config";
import express, { Express } from "express";
import session from "express-session";
import pool from "../db/db.js";
import apiRoutes from "../routes/index.js";

const PORT = process.env.PORT || 3001;
const app: Express = express();

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.error("🔴 Error: SESSION_SECRET is not defined in your .env file.");
  process.exit(1);
}

app.use(express.json());
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

app.use("/api", apiRoutes);

async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ Database connection successful. Server time:", result.rows[0].now);
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
