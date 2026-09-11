import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import {
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/session";
import { User } from "@/models";


// ─────────────────────────────────────────────
// Session API
//
// IMPORTANT:
// The session cookie is only used to identify
// the logged-in user.
//
// User information is always loaded from
// MongoDB so changes made by an administrator
// are reflected immediately.
// ─────────────────────────────────────────────

export const dynamic = "force-dynamic";


// ─────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    // ─────────────────────────────────────────
    // Get Session Cookie
    // ─────────────────────────────────────────

    const token =
      req.cookies.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        {
          status: 200,
        }
      );
    }


    // ─────────────────────────────────────────
    // Verify Session Token
    // ─────────────────────────────────────────

    const session =
      verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        {
          status: 200,
        }
      );
    }


    // ─────────────────────────────────────────
    // Connect Database
    // ─────────────────────────────────────────

    await connectDB();


    // ─────────────────────────────────────────
    // Get Latest User Data
    //
    // Password is never selected.
    // ─────────────────────────────────────────

    const user =
      await User.findById(session.id)
        .select("-password")
        .lean();


    // ─────────────────────────────────────────
    // User no longer exists
    // ─────────────────────────────────────────

    if (!user) {
      const response =
        NextResponse.json(
          {
            authenticated: false,
            user: null,
          },
          {
            status: 200,
          }
        );

      // Remove invalid session cookie.
      response.cookies.set(
        SESSION_COOKIE,
        "",
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV ===
            "production",
          sameSite: "lax",
          maxAge: 0,
          path: "/",
        }
      );

      return response;
    }


    // ─────────────────────────────────────────
    // Session Version Check
    //
    // If an admin resets the password or changes
    // the email, sessionVersion is incremented.
    //
    // Old sessions then become invalid.
    // ─────────────────────────────────────────

    const databaseSessionVersion =
      typeof user.sessionVersion === "number"
        ? user.sessionVersion
        : 0;

    const sessionVersion =
      typeof session.sessionVersion ===
      "number"
        ? session.sessionVersion
        : 0;


    if (
      databaseSessionVersion !==
      sessionVersion
    ) {
      const response =
        NextResponse.json(
          {
            authenticated: false,
            user: null,
            error:
              "Your session has expired. Please log in again.",
          },
          {
            status: 200,
          }
        );

      // Clear the old session.
      response.cookies.set(
        SESSION_COOKIE,
        "",
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV ===
            "production",
          sameSite: "lax",
          maxAge: 0,
          path: "/",
        }
      );

      return response;
    }


    // ─────────────────────────────────────────
    // Permissions
    //
    // Admin gets every permission.
    //
    // Other users receive exactly what is stored
    // in MongoDB.
    // ─────────────────────────────────────────

    const permissions =
      user.role === "admin"
        ? {
            dashboard: true,
            applications: true,
            announcements: true,
            events: true,
            projects: true,
            resources: true,
            messages: true,
            team: true,
            settings: true,
          }
        : {
            dashboard:
              user.permissions?.dashboard ===
              true,

            applications:
              user.permissions
                ?.applications === true,

            announcements:
              user.permissions
                ?.announcements === true,

            events:
              user.permissions?.events ===
              true,

            projects:
              user.permissions?.projects ===
              true,

            resources:
              user.permissions?.resources ===
              true,

            messages:
              user.permissions?.messages ===
              true,

            team:
              user.permissions?.team === true,

            settings:
              user.permissions?.settings ===
              true,
          };


    // ─────────────────────────────────────────
    // Return Fresh Session Data
    // ─────────────────────────────────────────

    return NextResponse.json({
      authenticated: true,

      user: {
        id: user._id.toString(),

        name: user.name,

        email: user.email,

        role: user.role,

        facultyPosition:
          user.facultyPosition ?? null,

        permissions,

        sessionVersion:
          databaseSessionVersion,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/auth/session error:",
      error
    );

    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        error:
          "Failed to verify session",
      },
      {
        status: 500,
      }
    );
  }
}