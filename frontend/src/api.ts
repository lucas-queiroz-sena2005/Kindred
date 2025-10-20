import axios, { isAxiosError } from "axios";
import type { LoginCredentials, RegisterCredentials } from "./types/auth";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export async function checkAuthStatus(): Promise<{
  user: { id: number; username: string };
} | null> {
  try {
    const response = await api.get("/me");
    return response.data;
  } catch (error) {
    return null;
  }
}

export async function loginUser(
  creds: LoginCredentials
): Promise<{ id: number; username: string }> {
  try {
    const response = await api.post("/auth/login", creds);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw error;
    }
    throw new Error("An unexpected error occurred during login.");
  }
}

export async function registerUser(
  creds: RegisterCredentials
): Promise<{ username: string }> {
  try {
    const response = await api.post("/auth/register", creds);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw error;
    }
    throw new Error("An unexpected error occurred during registration.");
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw error;
    }
    throw new Error("An unexpected error occurred during logout.");
  }
}
