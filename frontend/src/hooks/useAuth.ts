import { useContext } from "react";
import { AuthContext } from "../components/AuthProvider";
import type { AuthContextType } from "../types/auth";

export function useAuth() {
  const context = useContext<AuthContextType | undefined>(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
