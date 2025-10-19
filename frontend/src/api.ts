import axios from "axios";
import type { LoginCredentials, RegisterCredentials } from "./types/auth";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export async function loginUser(creds: LoginCredentials): Promise<{ username: string }> {
  try {
    const response = await api.post("/auth/login", creds);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Login failed");
    }
    throw error;
  }
}

export async function registerUser(creds: RegisterCredentials): Promise<{ username: string }> {
  try {
    const response = await api.post("/auth/register", creds);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Registration failed");
    }
    throw error;
  }
}
