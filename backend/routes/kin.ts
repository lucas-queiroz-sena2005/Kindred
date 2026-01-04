import { Router } from "express";
import {
  getKins,
  compareKin,
  getKinCategories,
} from "../controllers/kinController.js";

const kinRouter = Router();

kinRouter.get("/categories", getKinCategories);
kinRouter.get("/list", getKins);
kinRouter.get("/compare", compareKin);

export default kinRouter;