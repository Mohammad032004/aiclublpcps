import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
  type PermissionKey,
} from "@/lib/session";
import { connectDB } from "@/lib/db";
import { User } from "@/models";


// ─────────────────────────────────────────────
// Current User
// Reads the session cookie and then fetches the
// latest user data directly from MongoDB.
// ─────────────────────────────────────────────

export async function getCurrentUser(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value;

    if (!token) {
      return null;
    }

    const session = verifySessionToken(token);

    if (!session) {
      return null;
    }

    await connectDB();

    const user = await User.findById(session.id)
      .select("-password")
      .lean();

    if (!user) {
      return null;
    }

    // ─────────────────────────────────────────
    // Session Version Check
    //
    // If sessionVersion exists in both the DB and
    // the token, make sure they match.
    //
    // This allows password/security changes to
    // invalidate older sessions.
    // ─────────────────────────────────────────

    const databaseSessionVersion =
      typeof user.sessionVersion === "number"
        ? user.sessionVersion
        : 0;

    const sessionVersion =
      typeof session.sessionVersion === "number"
        ? session.sessionVersion
        : 0;

    if (databaseSessionVersion !== sessionVersion) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}


// ─────────────────────────────────────────────
// Require Authentication
// ─────────────────────────────────────────────

export async function requireAuth(req: NextRequest) {
  const user = await getCurrentUser(req);

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}


// ─────────────────────────────────────────────
// Require Admin
//
// Only users with role = admin can continue.
// ─────────────────────────────────────────────

export async function requireAdmin(req: NextRequest) {
  const user = await getCurrentUser(req);

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      ),
    };
  }

  if (user.role !== "admin") {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          error: "Forbidden. Administrator access required.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}


// ─────────────────────────────────────────────
// Require Permission
//
// Admins automatically have every permission.
//
// Other users must have the requested permission
// enabled in MongoDB.
// ─────────────────────────────────────────────

export async function requirePermission(
  req: NextRequest,
  permission: PermissionKey
) {
  const user = await getCurrentUser(req);

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      ),
    };
  }

  // Admin automatically gets access to everything.
  if (user.role === "admin") {
    return {
      user,
      response: null,
    };
  }

  const permissions = user.permissions || {};

  const hasPermission =
    permissions[permission] === true;

  if (!hasPermission) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          error: "Forbidden. You do not have permission to access this resource.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}


// ─────────────────────────────────────────────
// Helper: Is Admin
// ─────────────────────────────────────────────

export function isAdmin(
  user: {
    role?: string;
  } | null
) {
  return user?.role === "admin";
}


// ─────────────────────────────────────────────
// Helper: Has Permission
// ─────────────────────────────────────────────

export function hasPermission(
  user: {
    role?: string;
    permissions?: Record<string, boolean>;
  } | null,
  permission: PermissionKey
) {
  if (!user) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  return user.permissions?.[permission] === true;
}