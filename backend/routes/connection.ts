import { Router } from "express";
import {
  getRequests,
  askConnection,
  rejectConnectionRequest,
  cancelConnection,
} from "../controllers/connectionController.js";

const connectionRouter = Router();

connectionRouter.get("/requests", getRequests);
connectionRouter.post("/:targetId/ask", askConnection);
connectionRouter.delete("/:targetId/reject", rejectConnectionRequest);
connectionRouter.delete("/:targetId/cancel", cancelConnection);

export default connectionRouter;
