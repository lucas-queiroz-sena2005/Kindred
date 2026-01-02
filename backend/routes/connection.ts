import { Router } from "express";
import {
  getRequests,
  getStatus,
  askConnection,
  rejectConnectionRequest,
  cancelConnection,
  blockUser,
  unblockUser,
} from "../controllers/connectionController.js";

const connectionRouter = Router();

connectionRouter.get("/requests", getRequests);
connectionRouter.get("/:targetId/status", getStatus);
connectionRouter.post("/:targetId/ask", askConnection);
connectionRouter.post("/:targetId/block", blockUser);
connectionRouter.delete("/:targetId/unblock", unblockUser);
connectionRouter.delete("/:targetId/reject", rejectConnectionRequest);
connectionRouter.delete("/:targetId/cancel", cancelConnection);

export default connectionRouter;
