import { useEffect, useCallback } from "react";

/**
 * Creates a debounced function that delays invoking `func` until after `delay`
 * milliseconds have elapsed since the last time the debounced function was invoked.
 * @param func The function to debounce.
 * @param delay The number of milliseconds to delay.
 * @returns A new debounced function.
 */
function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  } as T;
}

/**
 * A custom React hook that triggers a callback function when the user scrolls
 * near the bottom of the page. This is useful for implementing infinite scrolling.
 *
 * @param fetchNextPage - The function to call to fetch more data.
 * @param hasNextPage - A boolean indicating if there is more data to fetch.
 * @param isFetchingNextPage - A boolean indicating if a fetch is already in progress.
 */
export function useOnScrollToBottom(
  fetchNextPage: () => void,
  hasNextPage: boolean,
  isFetchingNextPage: boolean
) {
  const handleScroll = useCallback(
    debounce(() => {
      // Check if the user has scrolled to within 200px of the bottom
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 200;

      if (isAtBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, 300),
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
}
