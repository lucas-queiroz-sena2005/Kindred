import { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService.js";
import { createToken, setTokenCookie } from "../utils/tokenUtils.js";
import { ApiError } from "../errors/customErrors.js";
import { authConfig } from "../config/authConfig.js";

export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Call for registration
    const registeredUser = await authService.register(req.body);

    // Token creation and set
    const token = createToken(registeredUser.id, authConfig.JWT_SECRET);
    setTokenCookie(res, token);

    res.status(201).json({ user: registeredUser, token });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ error: err.message });
    }

    // Passing errors to global handler
    next(err);
  }
}

export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Call for login
    const user = await authService.login(req.body);

    // Token creation
    const token = createToken(user.id, authConfig.JWT_SECRET);
    setTokenCookie(res, token);

    res.status(200).json({ user, token });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ error: err.message });
    }

    // Passing errors to global handler
    next(err);
  }
}

export async function logoutUser(req: Request, res: Response) {
  res.clearCookie("token");
  res.sendStatus(200);
}
