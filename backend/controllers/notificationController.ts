import { Request, Response } from "express";
import * as notificationService from "../services/notificationService.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
      };
    }
  }
}

export const getNotifications = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  try {
    const notifications =
      await notificationService.getNotificationsAndMarkAsRead(userId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

export const getUnreadNotificationCount = async (
  req: Request,
  res: Response,
) => {
  const userId = req.user!.id;
  try {
    const count = await notificationService.getUnreadNotificationCount(userId);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching notification count" });
  }
};
