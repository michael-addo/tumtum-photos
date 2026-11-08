import crypto from "node:crypto";
import type { RequestHandler } from "express";
import { config } from "./config.js";

const expectedHash = config.adminToken
  ? crypto.createHash("sha256").update(config.adminToken).digest()
  : null;

export function adminEnabled(): boolean {
  return expectedHash !== null;
}

export function isAdminTokenValid(candidate: string): boolean {
  if (!expectedHash) return false;
  const actualHash = crypto.createHash("sha256").update(candidate).digest();
  return crypto.timingSafeEqual(actualHash, expectedHash);
}

function bearerFrom(header: string | undefined): string {
  const raw = (header ?? "").trim();
  return raw.toLowerCase().startsWith("bearer ") ? raw.slice(7).trim() : "";
}

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!expectedHash) {
    res.status(503).json({
      error: "admin_disabled",
      message: "Set the ADMIN_TOKEN environment variable to enable the admin area.",
    });
    return;
  }

  if (!isAdminTokenValid(bearerFrom(req.get("authorization")))) {
    res.status(401).json({ error: "unauthorized", message: "A valid admin token is required." });
    return;
  }

  next();
};
