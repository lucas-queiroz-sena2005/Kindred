import axios, { isAxiosError } from "axios";
import type {
  LoginCredentials,
  RegisterCredentials,
  User,
} from "./types/auth";
import type {
  TierListData as TierListDataType, // Renamed to avoid conflict with local type
  TierState,
  TierListSummary,
} from "./types/tierlist";

const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// This interceptor centralizes error handling for all API requests.
axiosInstance.interceptors.response.use(
  (response) => response, // Simply return the response on success
  (error) => {
    // If it's a structured API error, re-throw it for components to handle.
    if (isAxiosError(error) && error.response) {
      return Promise.reject(error);
    }
    // Otherwise, throw a generic error.
    return Promise.reject(new Error("An unexpected network error occurred."));
  }
);

async function checkAuthStatus(): Promise<{ user: User } | null> {
  try {
    const response = await axiosInstance.get("/user/me");
    return response.data;
  } catch (error) {
    return null;
  }
}

async function loginUser(creds: LoginCredentials): Promise<User> {
  const response = await axiosInstance.post("/auth/login", creds);
  return response.data;
}

async function registerUser(creds: RegisterCredentials): Promise<{
  username: string;
}> {
  const response = await axiosInstance.post("/auth/register", creds);
  return response.data;
}

async function logoutUser(): Promise<void> {
  await axiosInstance.post("/auth/logout");
}

export interface GetTierlistListParams {
  sortBy?: "title" | "createdAt";
  filter?: "all" | "ranked" | "unranked";
  limit?: number;
  offset?: number;
}

/**
 * Fetches a list of tierlist templates.
 * @param params - Optional query parameters for sorting, filtering, and pagination.
 */
async function getTierlistList(
  params: GetTierlistListParams = {}
): Promise<TierListSummary[]> {
  const response = await axiosInstance.get<TierListSummary[]>("/tierlists", {
    params,
  });
  return response.data;
}

/**
 * The data structure returned when fetching a single tierlist.
 * It includes the base template info and either the user's ranked tiers
 * or the unranked movies if the user hasn't ranked it yet.
 */
export type TierListData = Omit<TierListDataType, "movies"> & {
  rankedTiers: TierState | null; // User's rankings if they exist
  unrankedMovies: TierListDataType["movies"]; // Movies to be ranked
};

/**
 * Fetches a single tierlist by its ID.
 * The response will contain the user's rankings if they exist,
 * otherwise it will contain the list of movies to be ranked.
 * @param tierlistId - The ID of the tierlist to fetch.
 */
async function getTierlist(tierlistId: number): Promise<TierListData> {
  const response = await axiosInstance.get<TierListData>(`/tierlists/${tierlistId}`);
  return response.data;
}

// Grouped API methods for cleaner imports and usage
export const api = {
  auth: {
    checkStatus: checkAuthStatus,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
  },
  tierlists: {
    getList: getTierlistList,
    getById: getTierlist,
  },
};
