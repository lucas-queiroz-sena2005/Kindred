import { Router } from "express";
import authRouter from "./auth.js";
import userRouter from "./me.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "API is alive and running!" });
});

router.use("/auth", authRouter);
router.use("/", isAuthenticated, userRouter);

export default router;
