import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/isAuthenticated.js";
import { ApiError } from "../errors/customErrors.js";
import * as MessageService from "../services/messageService.js";

function validateRequest(req: AuthenticatedRequest) {
  const userId = req.user!.id;
  const targetIdParam = req.params.targetId || (req.query.targetId as string);
  const targetId = parseInt(targetIdParam, 10);

  if (isNaN(targetId)) {
    throw new ApiError("Target ID must be a valid number.", 400);
  }
  if (userId === targetId) {
    throw new ApiError("Cannot perform this action on self.", 400);
  }

  return { userId, targetId };
}

function validateGetListParams(req: AuthenticatedRequest) {
  const limitStr = req.query.limit as string | undefined;
  const limit = limitStr ? parseInt(limitStr, 10) : 50;
  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new ApiError(
      "Invalid limit. Must be a number between 1 and 100.",
      400,
    );
  }

  const offsetStr = req.query.offset as string | undefined;
  const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
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
    const { userId, targetId } = validateRequest(req);
    const { limit, offset } = validateGetListParams(req);

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
    const { userId, targetId } = validateRequest(req);
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
