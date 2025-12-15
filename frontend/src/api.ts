<<<<<<< HEAD
import axios, { isAxiosError, AxiosError } from "axios";
import type {
  AxiosResponse // Importe AxiosResponse como tipo
} from "axios";
=======
import axios, { isAxiosError } from "axios";
>>>>>>> main
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

<<<<<<< HEAD
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (isAxiosError(error) && error.response) {
      let errorMessage = "An unexpected API error occurred.";

      const responseData = error.response.data;
      if (responseData && typeof responseData === 'object') {
         const typedResponseData = responseData as { message?: string; error?: string };
         errorMessage = typedResponseData.message || typedResponseData.error || errorMessage;
      }

      switch (error.response.status) {
        case 400:
          errorMessage = errorMessage !== "An unexpected API error occurred." ? errorMessage : "Dados inválidos. Por favor, verifique suas entradas.";
          break;
        case 401:
          errorMessage = "Não autorizado. Faça login novamente.";
          break;
        case 403:
          errorMessage = "Acesso proibido.";
          break;
        case 404:
          errorMessage = errorMessage !== "An unexpected API error occurred." ? errorMessage : "Recurso não encontrado.";
          break;
        case 409:
          errorMessage = "Conflito: este recurso já existe.";
          break;
        case 500:
          errorMessage = "Erro interno do servidor. Tente novamente mais tarde.";
          break;
        default:
          errorMessage = errorMessage;
      }

      error.message = errorMessage;

    } else if (error.request) {
      error.message = "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.";
    } else {
      error.message = "Ocorreu um erro inesperado ao configurar a solicitação.";
    }

    return Promise.reject(error);
=======
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
>>>>>>> main
  }
);

async function checkAuthStatus(): Promise<{ user: User } | null> {
  try {
    const response = await axiosInstance.get("/user/me");
    return response.data;
  } catch (error) {
<<<<<<< HEAD
    console.error("Erro ao verificar status de autenticação:", error);
=======
>>>>>>> main
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

<<<<<<< HEAD
=======
/**
 * Fetches a list of tierlist templates.
 * @param params - Optional query parameters for sorting, filtering, and pagination.
 */
>>>>>>> main
async function getTierlistList(
  params?: GetTierlistListParams
): Promise<TierListSummary[]> {
  const response = await axiosInstance.get<TierListSummary[]>("/tierlist/list", {
    params,
  });
  return response.data;
}

<<<<<<< HEAD
=======
/**
 * Fetches a single tierlist by its ID.
 * The response will contain the user's rankings if they exist,
 * otherwise it will contain the list of movies to be ranked.
 * @param tierlistId - The ID of the tierlist to fetch.
 */
>>>>>>> main
async function getTierlist(tierlistId: number): Promise<TierListData> {
  const response = await axiosInstance.get<TierListData>(`/tierlist/${tierlistId}`);
  return response.data;
}
<<<<<<< HEAD

async function getKin(): Promise<KinUser[]> {
  const response = await axiosInstance.get<{ users: KinUser[] }>("/user/kin");
  return response.data.users;
}

=======
async function getKin(): Promise<KinUser[]> {
    const response = await axiosInstance.get<{ users: KinUser[] }>("/user/kin");
    return response.data.users;
}
/**
 * Saves a user's tierlist rankings.
 * @param tierlist - The tierlist data, including the user's rankings.
 * @returns A promise that resolves with a success message.
 */
>>>>>>> main
async function saveTierlist(tierlist: TierlistResponse): Promise<string> {
  const response = await axiosInstance.post(`/tierlist/${tierlist.templateId}`, tierlist);
  return response.data;
}

<<<<<<< HEAD
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
=======
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
>>>>>>> main
