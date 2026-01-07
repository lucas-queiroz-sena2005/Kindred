import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api';
import type { TmdbConfig } from '../api';
import ImagePlaceholder from '../assets/image_placeholder.png'; // Import the placeholder image

interface TmdbConfigContextType {
  config: TmdbConfig | null;
  loading: boolean;
  error: string | null;
  getImageUrl: (path: string, size?: string) => string;
}

const TmdbConfigContext = createContext<TmdbConfigContextType | undefined>(undefined);

export const TmdbConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<TmdbConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await api.config.getTmdbConfig();
        setConfig(response);
      } catch (err) {
        setError('Failed to fetch TMDB configuration.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const getImageUrl = (path: string, size: string = 'w500'): string => {
    if (!config || !path) return ImagePlaceholder; // Use the placeholder if no config or path
    
    // Choose a poster size. 'w500' is a good default.
    // You could also implement logic to select the best size.
    const posterSize = config.poster_sizes.includes(size) ? size : 'original';

    return `${config.secure_base_url}${posterSize}${path}`;
  };

  return (
    <TmdbConfigContext.Provider value={{ config, loading, error, getImageUrl }}>
      {children}
    </TmdbConfigContext.Provider>
  );
};

export const useTmdbConfig = () => {
  const context = useContext(TmdbConfigContext);
  if (context === undefined) {
    throw new Error('useTmdbConfig must be used within a TmdbConfigProvider');
  }
  return context;
};
