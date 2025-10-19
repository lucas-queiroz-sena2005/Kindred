import axios, { isAxiosError } from "axios";
import type { LoginCredentials, RegisterCredentials } from "./types/auth";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

export async function loginUser(creds: LoginCredentials): Promise<{ username: string }> {
  try {
    const response = await api.post("/auth/login", creds);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw error;
    }
    throw new Error('An unexpected error occurred during login.');
  }
}

export async function registerUser(creds: RegisterCredentials): Promise<{ username: string }> {
  try {
    const response = await api.post("/auth/register", creds);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw error;
    }
    throw new Error('An unexpected error occurred during registration.');
  }
}