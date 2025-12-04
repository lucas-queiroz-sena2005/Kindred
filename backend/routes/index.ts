import { Router } from "express";
import authRouter from "./auth.js";
import userRouter from "./me.js";
import tierListRouter from "./tierlist.js";
import kinRouter from "./kin.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "API is alive and running!" });
});

router.use("/auth", authRouter);
router.use("/user", isAuthenticated, userRouter);
router.use("/tierlist", isAuthenticated, tierListRouter);
router.use("/kin", isAuthenticated, kinRouter);

export default router;
