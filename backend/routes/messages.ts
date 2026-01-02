import { Router } from "express";
import {
  getMessages,
  sendMessage,
  getConversations,
} from "../controllers/messageController.js";

const messageRouter = Router();

messageRouter.get("/conversations", getConversations);
messageRouter.get("/:targetId", getMessages);
messageRouter.post("/:targetId", sendMessage);

export default messageRouter;
