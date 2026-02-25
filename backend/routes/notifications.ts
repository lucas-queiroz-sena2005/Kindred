import express from "express";
import {
  getNotifications,
  getUnreadNotificationCount,
} from "../controllers/notificationController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const notificationRouter = express.Router();

notificationRouter.get("/", isAuthenticated, getNotifications);
notificationRouter.get(
  "/quantity",
  isAuthenticated,
  getUnreadNotificationCount,
);

export default notificationRouter;
