import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/isAuthenticated.js";
import { ApiError } from "../errors/customErrors.js";
import * as kinService from "../services/kinService.js";
import { FEATURE_NAMES, type FeatureName } from "../services/featureMap.js";

interface GetKinListQueryParams {
  filter: "all" | "connected" | "unconnected";
  sortBy: FeatureName | "overall";
  limit: number;
  offset: number;
}

function validateGetKinListQueryParams(
  query: AuthenticatedRequest["query"],
): GetKinListQueryParams {
  const FILTERS = ["all", "connected", "unconnected"] as const;
  const VALID_SORT_BY = ["overall", ...FEATURE_NAMES];
  const VALID_QUERY_PARAMS = ["filter", "sortBy", "limit", "offset"];

  // 1. Reject any unknown query parameters to enforce a strict API contract.
  for (const param in query) {
    if (!VALID_QUERY_PARAMS.includes(param)) {
      throw new ApiError(
        `Unknown query parameter: '${param}'. Valid parameters are: ${VALID_QUERY_PARAMS.join(", ")}`,
        400,
      );
    }
  }

  // 2. Validate each parameter, applying defaults if they are not provided.
  const filter = query.filter as GetKinListQueryParams["filter"] | undefined;
  if (filter && !FILTERS.includes(filter)) {
    throw new ApiError(
      `Invalid filter. Must be one of: ${FILTERS.join(", ")}`,
      400,
    );
  }

  const sortBy = query.sortBy as GetKinListQueryParams["sortBy"] | undefined;
  if (sortBy && !VALID_SORT_BY.includes(sortBy)) {
    throw new ApiError(
      `Invalid sortBy. Must be one of: ${VALID_SORT_BY.join(", ")}`,
      400,
    );
  }

  const limitStr = query.limit as string | undefined;
  const limit = limitStr ? parseInt(limitStr, 10) : 50;
  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new ApiError(
      "Invalid limit. Must be a number between 1 and 100.",
      400,
    );
  }

  const offsetStr = query.offset as string | undefined;
  const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
  if (isNaN(offset) || offset < 0) {
    throw new ApiError("Invalid offset. Must be a non-negative number.", 400);
  }

  return {
    filter: filter || "all",
    sortBy: sortBy || "overall",
    limit,
    offset,
  };
}

export async function getKins(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { filter, limit, offset, sortBy } = validateGetKinListQueryParams(
    req.query,
  );
  try {
    const kinData = await kinService.getKinListbyId(
      userId,
      filter,
      sortBy,
      limit,
      offset,
    );
    res.status(200).json(kinData);
  } catch (error) {
    next(error);
  }
}

export async function compareKin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.id;
    const targetIdParam = req.params.targetId || (req.query.targetId as string);
    const targetId = parseInt(targetIdParam, 10);
    if (isNaN(targetId)) {
      throw new ApiError("Target ID must be a valid number.", 400);
    }
    if (userId === targetId) {
      throw new ApiError("Cannot compare with self.", 400);
    }

    const comparisonResult = await kinService.compareKin(userId, targetId);
    res.status(200).json(comparisonResult);
  } catch (error) {
    next(error);
  }
}
