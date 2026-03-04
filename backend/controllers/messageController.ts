import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/isAuthenticated.js";
import { ApiError } from "../errors/customErrors.js";
import * as MessageService from "../services/messageService.js";

export function validateRequest(
  userId: number | undefined,
  targetIdInput: string | number | undefined,
) {
  if (!userId) {
    throw new ApiError("Authentication required.", 401);
  }
  const targetId =
    typeof targetIdInput === "string"
      ? parseInt(targetIdInput, 10)
      : targetIdInput;

  if (targetId === undefined || isNaN(targetId as number)) {
    throw new ApiError("Target ID must be a valid number.", 400);
  }

  if (userId === targetId) {
    throw new ApiError("Cannot perform this action on self.", 400);
  }

  return { userId, targetId: targetId as number };
}

export function validateGetListParams(
  limitInput: number | string | undefined,
  offsetInput: number | string | undefined,
) {
  const parseValue = (val: any) =>
    typeof val === "string" ? parseInt(val, 10) : val;

  const limit = limitInput !== undefined ? parseValue(limitInput) : 50;
  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new ApiError(
      "Invalid limit. Must be a number between 1 and 100.",
      400,
    );
  }

  const offset = offsetInput !== undefined ? parseValue(offsetInput) : 0;
  if (isNaN(offset) || offset < 0) {
    throw new ApiError("Invalid offset. Must be a non-negative number.", 400);
  }

  return { limit, offset };
}

export async function getMessages(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId, targetId } = validateRequest(
      req.user?.id,
      req.params.targetId,
    );
    const { limit, offset } = validateGetListParams(
      req.params.limit,
      req.params.offset,
    );

    const messages = await MessageService.getMessages(
      userId,
      targetId,
      limit,
      offset,
    );
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId, targetId } = validateRequest(
      req.user?.id,
      req.params.targetId,
    );
    const { message } = req.body;

    if (
      !message ||
      typeof message !== "string" ||
      message.length < 1 ||
      message.length > 255
    ) {
      throw new ApiError(
        "Message is required and must be a string between 1 and 255 characters.",
        400,
      );
    }

    const messages = await MessageService.sendMessage(
      userId,
      targetId,
      message,
    );
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
}

export async function getConversations(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.id;
    const conversations = await MessageService.getConversations(userId);
    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
}
