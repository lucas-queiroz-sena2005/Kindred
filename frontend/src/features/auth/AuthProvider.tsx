import { useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { api } from "@/api";
import type {
  LoginCredentials,
  RegisterCredentials,
  User,
  AuthContextType,
} from "@/types/auth";
import { AuthContext } from "./AuthContext";

function sanitizeUser(u: User): User | null {
  const id = Number(u.id);
  if (!Number.isFinite(id)) return null;
  return { ...u, id };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const authData = await api.auth.checkStatus();
        if (cancelled) return;
        if (authData?.user) {
          setUser(sanitizeUser(authData.user));
        } else {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogin(credentials: LoginCredentials): Promise<void> {
    const loggedIn = await api.auth.login(credentials);
    const next = sanitizeUser(loggedIn);
    if (!next) throw new Error("Invalid user payload from server.");
    setUser(next);
  }

  async function handleLogout(): Promise<void> {
    await api.auth.logout();
    setUser(null);
  }

  async function handleRegister(
    credentials: RegisterCredentials,
  ): Promise<User> {
    return api.auth.register(credentials);
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
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
