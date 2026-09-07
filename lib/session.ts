import crypto from "crypto";

/**
 * Minimal signed-cookie session for the admin panel.
 *
 * Uses Node's built-in crypto (HMAC-SHA256).
 *
 * The cookie contains only trusted session information.
 * Permissions can be refreshed from the database when needed.
 */

const SECRET =
  process.env.SESSION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "dev-insecure-secret-change-me";

export const SESSION_COOKIE = "admin_session";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ─────────────────────────────────────────────
// Permission Types
// ─────────────────────────────────────────────

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

export type Permissions = Record<
  PermissionKey,
  boolean
>;

// ─────────────────────────────────────────────
// Session Payload
// ─────────────────────────────────────────────

export interface SessionPayload {
  id: string;
  name: string;
  email: string;

  role:
    | "admin"
    | "faculty"
    | "core"
    | "member"
    | string;

  facultyPosition?:
    | "faculty_head"
    | "club_instructor"
    | null;

  permissions?: Partial<Permissions>;

  exp: number;
}

// ─────────────────────────────────────────────
// Secret
// ─────────────────────────────────────────────

function sign(data: string): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
}

// ─────────────────────────────────────────────
// Constant-time comparison
// ─────────────────────────────────────────────

function safeEqual(
  a: string,
  b: string
): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    bufA,
    bufB
  );
}

// ─────────────────────────────────────────────
// Create Session
// ─────────────────────────────────────────────

export function createSessionToken(
  payload: Omit<
    SessionPayload,
    "exp"
  >
): string {
  const full: SessionPayload = {
    ...payload,
    exp:
      Date.now() +
      SESSION_MAX_AGE * 1000,
  };

  const data = Buffer.from(
    JSON.stringify(full)
  ).toString("base64url");

  const signature = sign(data);

  return `${data}.${signature}`;
}

// ─────────────────────────────────────────────
// Verify Session
// ─────────────────────────────────────────────

export function verifySessionToken(
  token?: string | null
): SessionPayload | null {
  if (!token) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const [data, signature] = parts;

  if (!data || !signature) {
    return null;
  }

  const expectedSignature = sign(data);

  if (
    !safeEqual(
      signature,
      expectedSignature
    )
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(
        data,
        "base64url"
      ).toString("utf8")
    ) as SessionPayload;

    if (
      !payload.exp ||
      payload.exp < Date.now()
    ) {
      return null;
    }

    if (
      !payload.id ||
      !payload.email ||
      !payload.name
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}