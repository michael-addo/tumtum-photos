import path from "node:path";
import { fileURLToPath } from "node:url";

const serverDir = path.dirname(fileURLToPath(import.meta.url));

/** Repository root (the directory containing package.json). */
export const projectRoot = path.resolve(serverDir, "..");

function intFromEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function flagFromEnv(name: string): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

export const config = {
  port: intFromEnv("PORT", 3000, 1, 65_535),
  host: process.env.HOST?.trim() || "127.0.0.1",
  nodeEnv: process.env.NODE_ENV?.trim() || "development",
  dataDir: path.resolve(projectRoot, "data"),
  publicDir: path.resolve(projectRoot, "public"),
  adminToken: process.env.ADMIN_TOKEN?.trim() || null,
  trustProxy: flagFromEnv("TRUST_PROXY"),
} as const;

export const isProduction = config.nodeEnv === "production";
