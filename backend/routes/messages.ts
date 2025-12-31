import { Router } from "express";
import {
  getMessages,
  sendMessage,
} from "../controllers/messageController.js";

const messageRouter = Router();

messageRouter.get("/:targetId", getMessages);
messageRouter.post("/:targetId", sendMessage);

export default messageRouter;
