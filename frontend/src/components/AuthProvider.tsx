import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { checkAuthStatus, loginUser, logoutUser } from "../api";
import type { LoginCredentials, User, AuthContextType } from "../types/auth";

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
        const authData = await checkAuthStatus();
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
      const user = await loginUser(credentials);
      setUser(user);
    } catch (error) {
      throw error;
    }
  }

  async function handleLogout(): Promise<void> {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      throw error;
    }
  }

  const value = {
    isAuthenticated: !!user,
    user,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
