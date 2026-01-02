import { createContext, useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { api } from "../api";
import type {
  LoginCredentials,
  RegisterCredentials,
  User,
  AuthContextType,
} from "../types/auth";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify user session on initial load
    const verifyInitialSession = async () => {
      try {
        const authData = await api.auth.checkStatus();
        if (authData && authData.user) {
          setUser(authData.user);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyInitialSession();
  }, []);

  async function handleLogin(credentials: LoginCredentials): Promise<void> {
    try {
      const user = await api.auth.login(credentials);
      setUser(user);
    } catch (error) {
      throw error;
    }
  }

  async function handleLogout(): Promise<void> {
    try {
      await api.auth.logout();
      setUser(null);
    } catch (error) {
      throw error;
    }
  }

  async function handleRegister(
    credentials: RegisterCredentials
  ): Promise<any> {
    try {
      return await api.auth.register(credentials);
    } catch (error) {
      throw error;
    }
  }

  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      user,
      isLoading,
      login: handleLogin,
      logout: handleLogout,
      register: handleRegister,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
