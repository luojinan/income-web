import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCompactNumber(value: number) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue < 1000) {
    return `${Math.round(value)}`;
  }

  const compact = absValue < 1_000_000 ? absValue / 1000 : absValue / 1_000_000;
  const suffix = absValue < 1_000_000 ? "k" : "M";
  const formatted = compact >= 100 ? compact.toFixed(0) : compact.toFixed(1);

  return `${sign}${formatted.replace(/\.0$/, "")}${suffix}`;
}
