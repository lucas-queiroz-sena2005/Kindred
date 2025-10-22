import { Router } from "express";
import {
  getTierlistList,
  getTierList,
  saveRanking,
} from "../controllers/tierlistController.js";

const tierListRouter = Router();

tierListRouter.get("/list", getTierlistList);

tierListRouter.get("/:tierlistId", getTierList);

tierListRouter.post("/", saveRanking);

export default tierListRouter;
