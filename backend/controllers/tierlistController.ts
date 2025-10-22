import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/isAuthenticated.js";
import * as tierlistService from "../services/tierlistService.js";

/**
 * Fetches a list of all available tierlist templates.
 * Supports query parameters for sorting and filtering.
 * ?sortBy=title|createdAt
 * ?filter=all|ranked|unranked
 */
export async function getTierlistList(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;
  const { sortBy, filter } = req.query;

  try {
    const templates = await tierlistService.getAllTemplates(
      userId,
      sortBy as string,
      filter as string
    );
    res.status(200).json(templates);
  } catch (error) {
    next(error);
  }
}

/**
 * Fetches a specific tierlist.
 * If the user has already ranked it, it returns their rankings.
 * Otherwise, it returns the tierlist template with its movies.
 */
export async function getTierList(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;
  const tierlistId = parseInt(req.params.tierlistId, 10);

  try {
    const tierlistData = await tierlistService.getTierlistById(tierlistId, userId);
    res.status(200).json(tierlistData);
  } catch (error) {
    next(error);
  }
}

/**
 * Saves a user's ranking for a tierlist.
 * This is an upsert operation: it creates a new ranking or updates an existing one.
 */
export async function saveRanking(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;
  const { templateId, rankedItems } = req.body; // rankedItems: [{ movieId, tier }]

  if (!templateId || !Array.isArray(rankedItems)) {
    return res.status(400).json({ message: "Invalid request body." });
  }

  try {
    const result = await tierlistService.saveUserRanking(
      userId,
      templateId,
      rankedItems
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}