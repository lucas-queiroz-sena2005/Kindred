import { Router, Response } from "express";
import { AuthenticatedRequest } from "../middleware/isAuthenticated.js";

const userRouter = Router();

userRouter.get("/me", (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  res.status(200).json({
    message: "Authenticated successfully.",
    user: {
      id: userId,
    },
  });
});

export default userRouter;
