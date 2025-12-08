import { Router } from "express";
import {
  getKins,
  compareKin
} from "../controllers/kinController.js";

const kinRouter = Router();

kinRouter.get("/list", getKins);
kinRouter.get("/compare", compareKin)

export default kinRouter;