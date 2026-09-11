import crypto from "crypto";

export const SESSION_COOKIE = "admin_session";

export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export type PermissionKey =
  | "dashboard"
  | "applications"
  | "announcements"
  | "events"
  | "projects"
  | "resources"
  | "messages"
  | "team"
  | "settings";

export type UserRole = "admin" | "faculty" | "core" | "member";

export type FacultyPosition =
  | "faculty_head"
  | "club_instructor"
  | null;

export type SessionPayload = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  facultyPosition?: FacultyPosition;
  permissions?: Record<string, boolean>;

  // Used to invalidate old sessions after security-sensitive changes
  sessionVersion?: number;

  exp: number;
};

const SECRET =
  process.env.SESSION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "dev-insecure-secret-change-me";

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64urlDecode(input: string) {
  const padded = input
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(input.length / 4) * 4, "=");

  return Buffer.from(padded, "base64");
}

function sign(data: string) {
  return base64url(
    crypto
      .createHmac("sha256", SECRET)
      .update(data)
      .digest()
  );
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function createSessionToken(
  payload: Omit<SessionPayload, "exp"> & { exp?: number }
) {
  const sessionPayload: SessionPayload = {
    ...payload,
    exp:
      payload.exp ??
      Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };

  const encodedPayload = base64url(
    JSON.stringify(sessionPayload)
  );

  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(
  token: string
): SessionPayload | null {
  try {
    if (!token) {
      return null;
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
      return null;
    }

    const [encodedPayload, signature] = parts;

    const expectedSignature = sign(encodedPayload);

    if (!safeEqual(signature, expectedSignature)) {
      return null;
    }

    const payload = JSON.parse(
      base64urlDecode(encodedPayload).toString("utf8")
    ) as SessionPayload;

    if (!payload?.id || !payload?.email || !payload?.role) {
      return null;
    }

    if (!payload.exp) {
      return null;
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("verifySessionToken error:", error);
    return null;
  }
}