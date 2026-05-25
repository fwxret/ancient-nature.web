import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAssetPath(path: string) {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  const base = import.meta.env.BASE_URL || "/"
  const normalizedBase = base.endsWith("/") ? base : base + "/"
  const cleanPath = path.startsWith("/") ? path.slice(1) : path
  return normalizedBase + cleanPath
}
