import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";

interface TmdbConfig {
  base_url: string;
  secure_base_url: string;
  poster_sizes: string[];
}

const TmdbConfigContext = createContext<TmdbConfig | undefined>(undefined);

export const TmdbConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<TmdbConfig | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchConfig = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const data = (await api.config.getTmdbConfig()) as TmdbConfig;
        setConfig(data);
      } catch (error) {
        console.error("Failed to fetch TMDB config:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [isAuthenticated]);

  if (loading || !config) {
    return <>{children}</>;
  }

  return (
    <TmdbConfigContext.Provider value={config}>
      {children}
    </TmdbConfigContext.Provider>
  );
};

export const useTmdbConfig = () => {
  const context = useContext(TmdbConfigContext);
  return context;
};
