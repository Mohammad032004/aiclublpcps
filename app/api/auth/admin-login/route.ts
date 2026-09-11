import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
} from "@/lib/session";
import { User } from "@/models";


// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Permissions = {
  dashboard: boolean;
  applications: boolean;
  announcements: boolean;
  events: boolean;
  projects: boolean;
  resources: boolean;
  messages: boolean;
  team: boolean;
  settings: boolean;
};


// ─────────────────────────────────────────────
// Admin Permissions
//
// Admin users automatically receive access to
// every section.
// ─────────────────────────────────────────────

const ADMIN_PERMISSIONS: Permissions = {
  dashboard: true,
  applications: true,
  announcements: true,
  events: true,
  projects: true,
  resources: true,
  messages: true,
  team: true,
  settings: true,
};


// ─────────────────────────────────────────────
// Normal User Permissions
//
// IMPORTANT:
// Do NOT force dashboard = true.
// Permissions come directly from MongoDB.
// ─────────────────────────────────────────────

function getUserPermissions(
  user: any
): Permissions {
  if (user.role === "admin") {
    return {
      ...ADMIN_PERMISSIONS,
    };
  }

  return {
    dashboard:
      user.permissions?.dashboard === true,

    applications:
      user.permissions?.applications === true,

    announcements:
      user.permissions?.announcements === true,

    events:
      user.permissions?.events === true,

    projects:
      user.permissions?.projects === true,

    resources:
      user.permissions?.resources === true,

    messages:
      user.permissions?.messages === true,

    team:
      user.permissions?.team === true,

    settings:
      user.permissions?.settings === true,
  };
}


// ─────────────────────────────────────────────
// POST
// Admin Panel Login
// ─────────────────────────────────────────────

export async function POST(
  req: NextRequest
) {
  try {
    // ─────────────────────────────────────────
    // Connect Database
    // ─────────────────────────────────────────

    await connectDB();


    // ─────────────────────────────────────────
    // Read Request
    // ─────────────────────────────────────────

    const body = await req.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";


    // ─────────────────────────────────────────
    // Validate Input
    // ─────────────────────────────────────────

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Email and password are required.",
        },
        {
          status: 400,
        }
      );
    }


    // ─────────────────────────────────────────
    // Find User
    // ─────────────────────────────────────────

    const user =
      await User.findOne({
        email,
      });


    // ─────────────────────────────────────────
    // Prevent Account Enumeration
    // ─────────────────────────────────────────

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }


    // ─────────────────────────────────────────
    // Verify Password
    // ─────────────────────────────────────────

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }


    // ─────────────────────────────────────────
    // Get Current Permissions
    // ─────────────────────────────────────────

    const permissions =
      getUserPermissions(user);


    // ─────────────────────────────────────────
    // Session Version
    //
    // This allows us to invalidate old sessions
    // when password/email/security information
    // changes.
    // ─────────────────────────────────────────

    const sessionVersion =
      typeof user.sessionVersion === "number"
        ? user.sessionVersion
        : 0;


    // ─────────────────────────────────────────
    // Create Session Token
    // ─────────────────────────────────────────

    const token =
      createSessionToken({
        id: user._id.toString(),

        name: user.name,

        email: user.email,

        role: user.role,

        facultyPosition:
          user.facultyPosition ?? null,

        permissions,

        sessionVersion,
      });


    // ─────────────────────────────────────────
    // Create Response
    // ─────────────────────────────────────────

    const response =
      NextResponse.json({
        success: true,

        message: "Login successful.",

        user: {
          id: user._id.toString(),

          name: user.name,

          email: user.email,

          role: user.role,

          facultyPosition:
            user.facultyPosition ?? null,

          permissions,

          sessionVersion,
        },
      });


    // ─────────────────────────────────────────
    // Set Secure Session Cookie
    // ─────────────────────────────────────────

    response.cookies.set(
      SESSION_COOKIE,
      token,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        maxAge: SESSION_MAX_AGE,

        path: "/",
      }
    );


    return response;
  } catch (error) {
    console.error(
      "POST /api/auth/admin-login error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while logging in.",
      },
      {
        status: 500,
      }
    );
  }
}