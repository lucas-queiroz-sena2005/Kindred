import { Router } from "express";
import authRouter from "./auth.js";
import userRouter from "./me.js";
import tierListRouter from "./tierlist.js";
import kinRouter from "./kin.js";
import messageRouter from "./messages.js";
import connectionRouter from "./connection.js";
import notificationRouter from "./notifications.js";
import configRouter from "./config.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = Router();


router.get("/", (req, res) => {
  res.json({ message: "API is alive and running!" });
});

router.use("/auth", authRouter);
router.use("/config", configRouter);
router.use("/user", isAuthenticated, userRouter);
router.use("/tierlist", isAuthenticated, tierListRouter);
router.use("/kin", isAuthenticated, kinRouter);
router.use("/messages", isAuthenticated, messageRouter);
router.use("/connection", isAuthenticated, connectionRouter);
router.use("/notifications", isAuthenticated, notificationRouter);

export default router;
