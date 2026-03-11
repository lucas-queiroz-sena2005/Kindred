import { useState, useEffect } from "react";

/**
 * Mobile-first: defaults to false so that on first paint (and SSR-safe) we assume
 * small viewport. Prevents tierlist and other UIs from showing desktop mode on mobile
 * before the media query resolves.
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQueryList.addEventListener("change", handleChange);
    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
};
