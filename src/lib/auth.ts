import { env } from "./env";

export function getAdminToken(): string | null {
  return env.ADMIN_TOKEN ?? null;
}

export function verifyAdminToken(token: string | null | undefined): boolean {
  const expected = getAdminToken();
  if (!expected || !token) return false;

  // Constant-time comparison to prevent timing attacks.
  const a = Buffer.from(token, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}