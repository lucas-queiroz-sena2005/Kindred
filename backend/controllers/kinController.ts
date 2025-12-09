import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/isAuthenticated.js";
import { ApiError } from "../errors/customErrors.js";
import * as kinService from "../services/kinService.js";
import { FEATURE_NAMES, type FeatureName } from "../services/featureMap.js";

interface GetKinListQueryParams {
  filter: "all" | "connected" | "unconnected";
  sortBy: FeatureName | "overall"
  limit: number;
  offset: number;
}

function validateGetKinListQueryParams(
  query: AuthenticatedRequest["query"]
): GetKinListQueryParams { 
  const FILTERS = ["all", "connected", "unconnected"] as const;
  const VALID_SORT_BY = ["overall", ...FEATURE_NAMES];
  const DEFAULT_LIMIT = 50;
  const MAX_LIMIT = 100;

  const filter = FILTERS.includes(query.filter as any)
    ? (query.filter as "all" | "connected" | "unconnected")
    : "all";
  
  const sortBy = VALID_SORT_BY.includes(query.sortBy as any)
    ? (query.sortBy as FeatureName | "overall")
    : "overall";
  
  const limit = Math.min(
    Math.max(parseInt(query.limit as string, 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );

  const offset = Math.max(parseInt(query.offset as string, 10) || 0, 0);

  return { filter, sortBy, limit, offset };
}

export async function getKins(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
    const userId = req.user!.id;
    const { filter, limit, offset, sortBy } =
      validateGetKinListQueryParams(req.query);
    try {
        const kinData = await kinService.getKinListbyId(
            userId,
            filter,
            sortBy,
            limit,
            offset
        )
        res.status(200).json(kinData);
    } catch (error) {
    next(error);
  }
}

export async function compareKin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;
  try {
    const targetId = parseInt(req.params.targetId, 10);
    if (isNaN(targetId)) {
      throw new ApiError("Target ID must be a valid number.", 400);
    }

    const comparisonResult = await kinService.compareKin(userId, targetId);
    res.status(200).json(comparisonResult);
  } catch (error) {
    next(error);
  }
}