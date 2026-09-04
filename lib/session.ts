import crypto from "crypto";

/**
 * Minimal signed-cookie session for the admin panel.
 * Uses Node's built-in crypto (HMAC-SHA256) — no extra dependencies.
 */

const SECRET =
  process.env.SESSION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "dev-insecure-secret-change-me";

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

export interface SessionPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  exp: number;
}

function sign(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const full: SessionPayload = { ...payload, exp: Date.now() + SESSION_MAX_AGE * 1000 };
  const data = Buffer.from(JSON.stringify(full)).toString("base64url");
  const sig = sign(data);
  return `${data}.${sig}`;
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  if (!safeEqual(sig, sign(data))) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
