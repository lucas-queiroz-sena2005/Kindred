import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/isAuthenticated.js";
import { ApiError } from "../errors/customErrors.js";
import * as tierlistService from "../services/tierlistService.js";

/**
 * Defines the structure for validated query parameters for getTierlistList.
 */
interface GetTierlistListQueryParams {
  sortBy: "title" | "createdAt";
  filter: "all" | "ranked" | "unranked";
  limit: number;
  offset: number;
}

/**
 * Validates and sanitizes query parameters for fetching tierlist templates.
 * @param query - The raw query object from the Express request.
 * @returns A validated and sanitized object of query parameters.
 */
function validateGetTierlistListQueryParams(
  query: AuthenticatedRequest["query"]
): GetTierlistListQueryParams {
  const SORT_BY = ["title", "createdAt"] as const;
  const FILTERS = ["all", "ranked", "unranked"] as const;
  const DEFAULT_LIMIT = 50;
  const MAX_LIMIT = 100;

  const sortBy = SORT_BY.includes(query.sortBy as any)
    ? (query.sortBy as "title" | "createdAt")
    : "title";
  const filter = FILTERS.includes(query.filter as any)
    ? (query.filter as "all" | "ranked" | "unranked")
    : "all";

  const limit = Math.min(
    Math.max(parseInt(query.limit as string, 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );

  const offset = Math.max(parseInt(query.offset as string, 10) || 0, 0);

  return { sortBy, filter, limit, offset };
}

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
  try {
    const userId = req.user!.id;
    // Validate and sanitize query parameters using the helper function
    const { sortBy, filter, limit, offset } =
      validateGetTierlistListQueryParams(req.query);

    // Pass validated parameters to the service layer
    const templates = await tierlistService.getAllTemplates(
      userId,
      sortBy,
      filter,
      limit,
      offset
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

  if (isNaN(tierlistId)) {
    return next(new ApiError("Tierlist ID must be a valid number.", 400));
  }

  try {
    const tierlistData = await tierlistService.getTierlistById(
      tierlistId,
      userId
    );
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
  const templateId = parseInt(req.params.templateId, 10);
  const { rankedItems } = req.body; // rankedItems: [{ movieId, tier }]

  try {
    if (isNaN(templateId)) {
      throw new ApiError("Template ID must be a valid number.", 400);
    }
    if (!Array.isArray(rankedItems)) {
      throw new ApiError("Request body must include a 'rankedItems' array.", 400);
    }

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