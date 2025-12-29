import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/messageController.js";

const messageRouter = Router();

messageRouter.get("/getmessages", getMessages);
messageRouter.post("/sendmessage", sendMessage);

export default messageRouter;
