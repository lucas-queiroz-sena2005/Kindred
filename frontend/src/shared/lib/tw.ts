import { cn } from "./cn";

export const tw = {
  focusRing:
    "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900",

  input: cn(
    "w-full rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-neutral-900",
    "placeholder:text-neutral-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100",
    "dark:placeholder:text-neutral-400",
  ),

  btnPrimary: cn(
    "rounded-lg bg-purple-600 px-4 py-2.5 font-medium text-white",
    "hover:bg-purple-700 disabled:bg-purple-400",
  ),

  btnSecondary: cn(
    "rounded-lg bg-gray-200 px-3 py-1 text-sm text-gray-800",
    "hover:bg-gray-300 dark:bg-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-500",
  ),

  card: cn(
    "rounded-lg border border-neutral-200 bg-white shadow-sm",
    "dark:border-neutral-700 dark:bg-neutral-800",
  ),

  topbarShell:
    "fixed top-0 z-40 w-full overflow-visible border-b border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950",

  navShell:
    "fixed left-0 right-0 top-16 z-30 flex h-14 items-center border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",

  navLink:
    "transition-colors hover:text-purple-600 dark:hover:text-purple-400",

  navLinkActive: "font-semibold text-purple-600 dark:text-purple-400",
} as const;
