/**
 * Railway, Docker, and shell exports often use TRUE / True / 1.
 * Only accepting lowercase "true" caused cross-site cookie mode to stay off.
 */
export function envIsTruthy(value: string | undefined): boolean {
  if (value == null) return false;
  const v = value.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

/** Comma-separated origins; trims and strips trailing slashes for comparison. */
export function parseCorsOrigins(
  raw: string | undefined,
  fallback: string,
): string[] {
  const source = (raw ?? fallback).trim() || fallback;
  return source
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}
