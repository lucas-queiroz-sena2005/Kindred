import { Router, Response } from "express";
import { AuthenticatedRequest } from "../middleware/isAuthenticated.js";
import pool from "../db/db.js";

const userRouter = Router();

userRouter.get("/me", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      // This case should technically be handled by isAuthenticated, but it's good practice
      return res.status(401).json({ message: "Authentication error." });
    }

    const { rows } = await pool.query(
      "SELECT id, username FROM users WHERE id = $1",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ user: rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching user." });
  }
});

export default userRouter;
