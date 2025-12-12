import axios, { isAxiosError } from "axios";
import type {
  LoginCredentials,
  RegisterCredentials,
  User,
} from "./types/auth";
import type {
  TierListData,
  TierlistResponse,
  TierListSummary,
} from "./types/tierlist";
import type { KinUser } from "./types/kin";

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
  params?: GetTierlistListParams
): Promise<TierListSummary[]> {
  const response = await axiosInstance.get<TierListSummary[]>("/tierlist/list", {
    params,
  });
  return response.data;
}

/**
 * Fetches a single tierlist by its ID.
 * The response will contain the user's rankings if they exist,
 * otherwise it will contain the list of movies to be ranked.
 * @param tierlistId - The ID of the tierlist to fetch.
 */
async function getTierlist(tierlistId: number): Promise<TierListData> {
  const response = await axiosInstance.get<TierListData>(`/tierlist/${tierlistId}`);
  return response.data;
}
async function getKin(): Promise<KinUser[]> {
    const response = await axiosInstance.get<{ users: KinUser[] }>("/user/kin");
    return response.data.users;
}
/**
 * Saves a user's tierlist rankings.
 * @param tierlist - The tierlist data, including the user's rankings.
 * @returns A promise that resolves with a success message.
 */
async function saveTierlist(tierlist: TierlistResponse): Promise<string> {
  const response = await axiosInstance.post(`/tierlist/${tierlist.templateId}`, tierlist);
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
      postTierlist: saveTierlist,
    },
    users: {
      getKin: getKin
    }
  };
