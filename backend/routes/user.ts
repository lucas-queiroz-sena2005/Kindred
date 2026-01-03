import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = Router();

router.get("/:id", isAuthenticated, userController.getUserById);

export default router;
