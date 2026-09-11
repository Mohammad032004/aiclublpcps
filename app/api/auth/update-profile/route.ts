import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
  createSessionToken,
  SESSION_MAX_AGE,
} from "@/lib/session";
import { connectDB } from "@/lib/db";
import { User, UserActivityLog } from "@/models";

export async function PATCH(req: NextRequest) {
  try {
    // ─────────────────────────────────────────
    // Get session cookie
    // ─────────────────────────────────────────

    const token = req.cookies.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "You are not authenticated.",
        },
        { status: 401 }
      );
    }

    // ─────────────────────────────────────────
    // Verify session token
    // ─────────────────────────────────────────

    const session = verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your session has expired. Please login again.",
        },
        { status: 401 }
      );
    }

    // ─────────────────────────────────────────
    // Connect database
    // ─────────────────────────────────────────

    await connectDB();

    // ─────────────────────────────────────────
    // Find logged-in user
    // ─────────────────────────────────────────

    const user = await User.findById(session.id);

    if (!user) {
      const response = NextResponse.json(
        {
          success: false,
          error: "User account not found.",
        },
        { status: 401 }
      );

      response.cookies.set({
        name: SESSION_COOKIE,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });

      return response;
    }

    // ─────────────────────────────────────────
    // Check session version
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
      const response = NextResponse.json(
        {
          success: false,
          error:
            "Your session is no longer valid. Please login again.",
        },
        { status: 401 }
      );

      response.cookies.set({
        name: SESSION_COOKIE,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });

      return response;
    }

    // ─────────────────────────────────────────
    // Read request body
    // ─────────────────────────────────────────

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────
    // Validate body
    // ─────────────────────────────────────────

    if (
      !body ||
      typeof body !== "object" ||
      !("name" in body)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Name is required.",
        },
        { status: 400 }
      );
    }

    const rawName = (body as { name?: unknown }).name;

    if (typeof rawName !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Name must be a valid text value.",
        },
        { status: 400 }
      );
    }

    const name = rawName.trim();

    // ─────────────────────────────────────────
    // Name validation
    // ─────────────────────────────────────────

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Name is required.",
        },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Name must contain at least 2 characters.",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Name cannot be longer than 100 characters.",
        },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────
    // Check if name changed
    // ─────────────────────────────────────────

    const oldName = user.name;

    if (oldName === name) {
      const safeUser = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        facultyPosition:
          user.facultyPosition ?? null,
      };

      return NextResponse.json({
        success: true,
        message: "No changes were made.",
        user: safeUser,
      });
    }

    // ─────────────────────────────────────────
    // Update user name
    // ─────────────────────────────────────────

    user.name = name;

    await user.save();

    // ─────────────────────────────────────────
    // Activity log
    //
    // IMPORTANT:
    // Never store passwords here.
    // ─────────────────────────────────────────

    try {
      await UserActivityLog.create({
        userId: user._id,
        action: "name_changed",
        description:
          "User changed their account name.",
        oldValue: oldName,
        newValue: name,
        changedBy: user._id,
        changedByType: "self",
      });
    } catch (logError) {
      // Do not undo a successful profile update
      // if activity logging happens to fail.
      console.error(
        "Failed to create user activity log:",
        logError
      );
    }

    // ─────────────────────────────────────────
    // Build current permissions
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

    // ─────────────────────────────────────────
    // Create refreshed session
    // ─────────────────────────────────────────

    const newToken = createSessionToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      facultyPosition:
        user.facultyPosition ?? null,
      permissions,
      sessionVersion: databaseSessionVersion,
    });

    // ─────────────────────────────────────────
    // Safe user object
    //
    // Password is NEVER returned.
    // ─────────────────────────────────────────

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      facultyPosition:
        user.facultyPosition ?? null,
    };

    // ─────────────────────────────────────────
    // Response
    // ─────────────────────────────────────────

    const response = NextResponse.json({
      success: true,
      message:
        "Your name has been updated successfully.",
      user: safeUser,
    });

    // ─────────────────────────────────────────
    // Refresh session cookie
    // ─────────────────────────────────────────

    response.cookies.set({
      name: SESSION_COOKIE,
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while updating your profile.",
      },
      { status: 500 }
    );
  }
}