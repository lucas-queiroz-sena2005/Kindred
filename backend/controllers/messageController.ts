import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/isAuthenticated.js";
import { ApiError } from "../errors/customErrors.js";
import * as MessageService from "../services/messageService.js";

function validateGetMessagesParams(req: AuthenticatedRequest) {
  const targetIdParam = req.params.targetId || (req.query.targetId as string);
  const targetId = parseInt(targetIdParam, 10);

  if (isNaN(targetId)) {
    throw new ApiError("Target ID must be a valid number.", 400);
  }

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
  return { targetId, limit, offset };
}
export async function getMessages(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.id;
    const { targetId, limit, offset } = validateGetMessagesParams(req);

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
    if (!req.body) {
      throw new ApiError("Request body is missing or not in JSON format.", 400);
    }
    const userId = req.user!.id;
    const targetIdParam = req.params.targetId || (req.query.targetId as string);
    const targetId = parseInt(targetIdParam, 10);
    let message = req.body.message;

    if (
      typeof message === "object" &&
      message !== null &&
      "message" in message
    ) {
      message = message.message;
    }

    if (!message) {
      throw new ApiError("Message is required.", 400);
    }
    if (message.length < 1 || message.length > 255) {
      throw new ApiError("Message too long.", 400);
    }
    if (isNaN(targetId)) {
      throw new ApiError("Target ID must be a valid number.", 400);
    }
    if (userId === targetId) {
      throw new ApiError("Cannot send message to self.", 400);
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
