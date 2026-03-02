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

export function validateGetKinListQueryParams(
  query: Record<string, any>,
): GetKinListQueryParams {
  const VALID_KEYS = ["filter", "sortBy", "limit", "offset"];

  // 1. Strict Key Check
  Object.keys(query).forEach((key) => {
    if (!VALID_KEYS.includes(key))
      throw new ApiError(`Unknown parameter: ${key}`, 400);
  });

  // 2. Helper for Range/Defaults
  const parseNum = (
    val: any,
    fallback: number,
    min: number,
    max = Infinity,
  ) => {
    const num = val ? parseInt(val, 10) : fallback;
    if (isNaN(num) || num < min || num > max)
      throw new ApiError(`Invalid number`, 400);
    return num;
  };

  const filter = query.filter ?? "all";
  const sortBy = query.sortBy ?? "overall";

  // 3. Simple Inclusion Checks
  if (!["all", "connected", "unconnected"].includes(filter))
    throw new ApiError("Invalid filter", 400);
  if (!["overall", ...FEATURE_NAMES].includes(sortBy))
    throw new ApiError("Invalid sortBy", 400);

  return {
    filter,
    sortBy,
    limit: parseNum(query.limit, 50, 1, 100),
    offset: parseNum(query.offset, 0, 0),
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

export function getKinCategories(req: Request, res: Response) {
  const categories = ["overall", ...FEATURE_NAMES];
  res.status(200).json(categories);
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
