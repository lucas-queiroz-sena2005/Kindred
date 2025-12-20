import axios, { isAxiosError, AxiosError } from "axios";
import type {
  AxiosResponse // Importe AxiosResponse como tipo
} from "axios";
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
  }
);

async function checkAuthStatus(): Promise<{ user: User } | null> {
  try {
    const response = await axiosInstance.get("/user/me");
    return response.data;
  } catch (error) {
    console.error("Erro ao verificar status de autenticação:", error);
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

async function getTierlistList(
  params?: GetTierlistListParams
): Promise<TierListSummary[]> {
  const response = await axiosInstance.get<TierListSummary[]>("/tierlist/list", {
    params,
  });
  return response.data;
}

async function getTierlist(tierlistId: number): Promise<TierListData> {
  const response = await axiosInstance.get<TierListData>(`/tierlist/${tierlistId}`);
  return response.data;
}

export interface GetKinListParams {
  filter?: "all" | "connected" | "unconnected";
  sortBy?: string;
  limit?: number;
  offset?: number;
}

async function getKin(params?: GetKinListParams): Promise<KinUser[]> {
  const response = await axiosInstance.get<KinUser[]>("/kin/list", {
    params,
  });
  return response.data;
}

async function saveTierlist(tierlist: TierlistResponse): Promise<string> {
  const response = await axiosInstance.post(`/tierlist/${tierlist.templateId}`, tierlist);
  return response.data;
}

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
  kin: {
    getKin: getKin
  }
};
