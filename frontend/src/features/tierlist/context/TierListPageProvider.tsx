import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Movie } from "../../../types/tierlist";

export interface TierListPageContextType {
  selectedMovie: Movie | null;
  setSelectedMovie: React.Dispatch<React.SetStateAction<Movie | null>>;
}

const TierListPageContext = createContext<TierListPageContextType | undefined>(
  undefined,
);

export const TierListPageProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  return (
    <TierListPageContext.Provider value={{ selectedMovie, setSelectedMovie }}>
      {children}
    </TierListPageContext.Provider>
  );
};

export const useTierListPage = () => {
  const context = useContext(TierListPageContext);
  if (context === undefined) {
    throw new Error(
      "useTierListPage must be used within a TierListPageProvider",
    );
  }
  return context;
};
