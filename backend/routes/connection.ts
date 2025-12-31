import { Router } from "express";
import {
  getRequests,
  askConnection,
  rejectConnectionRequest,
  cancelConnection,
  blockUser,
} from "../controllers/connectionController.js";

const connectionRouter = Router();

connectionRouter.get("/requests", getRequests);
connectionRouter.post("/:targetId/ask", askConnection);
connectionRouter.post("/:targetId/block", blockUser);
connectionRouter.delete("/:targetId/reject", rejectConnectionRequest);
connectionRouter.delete("/:targetId/cancel", cancelConnection);

export default connectionRouter;
