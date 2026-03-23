import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";
import ImagePlaceholder from "../assets/image_placeholder.png";

interface TmdbConfigData {
  base_url: string;
  secure_base_url: string;
  poster_sizes: string[];
}

interface TmdbConfigContextType {
  config: TmdbConfigData | null;
  loading: boolean;
  error: string | null;
  getImageUrl: (path: string, size?: string) => string;
}

const TmdbConfigContext = createContext<TmdbConfigContextType | undefined>(
  undefined,
);

export const TmdbConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<TmdbConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchConfig = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Cast to our interface to ensure property alignment
        const data = (await api.config.getTmdbConfig()) as TmdbConfigData;
        setConfig(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch TMDB configuration.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [isAuthenticated]);

  const getImageUrl = (path: string, size: string = "w500"): string => {
    if (!config || !path) return ImagePlaceholder;
    const posterSize = config.poster_sizes.includes(size) ? size : "original";
    return `${config.secure_base_url}${posterSize}${path}`;
  };

  const value: TmdbConfigContextType = {
    config,
    loading,
    error,
    getImageUrl,
  };

  return (
    <TmdbConfigContext.Provider value={value}>
      {children}
    </TmdbConfigContext.Provider>
  );
};

export const useTmdbConfig = () => {
  const context = useContext(TmdbConfigContext);
  if (context === undefined) {
    throw new Error("useTmdbConfig must be used within a TmdbConfigProvider");
  }
  return context;
};
